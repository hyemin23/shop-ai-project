import { createServiceClient } from "@/lib/supabase/server";
import { callGeminiWithImages } from "@/lib/gemini";
import {
  processImageFile,
  getStoragePath,
  base64ToBuffer,
  generateThumbnail,
} from "@/lib/image-utils";
import {
  spendTokensForGeneration,
  checkFreeTrialLimit,
  getCreditCost,
  TokenInsufficientError,
} from "@/lib/tokens";
import { StudioError } from "@/lib/errors";
import { createGenerationLog, updateGenerationLog } from "@/lib/generation-log";
import { getProcessor } from "@/lib/studio/registry";
import type { ProcessOptions, ProcessResult } from "@/lib/studio/types";

export type { ProcessOptions, ProcessResult };

const BUCKET = "studio-images";

export async function processSingleStudioRequest(
  options: ProcessOptions,
): Promise<ProcessResult> {
  const startTime = Date.now();
  let logId: string | null = null;

  try {
    const supabase = createServiceClient();

    // 무료 체험 한도 체크
    if (!options.skipTrialCheck) {
      const canProceed = await checkFreeTrialLimit(
        supabase,
        options.userId,
        options.sessionId,
      );
      if (!canProceed) {
        return {
          success: false,
          processingTime: Date.now() - startTime,
          error:
            "무료 체험 한도를 초과했습니다. 로그인 후 토큰을 충전해주세요.",
          code: "FREE_TRIAL_EXCEEDED",
        };
      }
    }

    // 소스 이미지 처리
    const sourceProcessed = await processImageFile(options.sourceFile);

    // Storage 업로드
    const sourcePath = getStoragePath(
      "source",
      options.sessionId,
      sourceProcessed.extension,
    );
    await supabase.storage
      .from(BUCKET)
      .upload(sourcePath, base64ToBuffer(sourceProcessed.base64), {
        contentType: sourceProcessed.mimeType,
      });
    const { data: sourceUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(sourcePath);

    // Strategy 패턴: 타입별 프로세서로 검증 + 프롬프트/이미지 빌드
    const processor = getProcessor(options.type);
    processor.validate(options);
    const buildResult = await processor.buildPromptAndImages(options, supabase);

    // 소스 이미지를 맨 앞에 합치고 공통 historyParams 병합
    const images = [
      { base64: sourceProcessed.base64, mimeType: sourceProcessed.mimeType },
      ...buildResult.images,
    ];
    const historyParams: Record<string, unknown> = {
      sourceImage: sourceUrlData.publicUrl,
      ...buildResult.historyParams,
    };
    if (options.userPrompt?.trim()) {
      historyParams.userPrompt = options.userPrompt.trim();
    }
    const prompt = buildResult.prompt;

    // 프로필 조회 (토큰 잔액, 마스터/베타 여부, 베타 API 키)
    let betaApiKey: string | undefined;
    let isMasterUser = false;
    if (options.userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("token_balance, is_master, is_beta, gemini_api_key")
        .eq("id", options.userId)
        .single();

      if (profile?.is_master) {
        isMasterUser = true;
      }

      if (profile?.is_beta && profile.gemini_api_key) {
        betaApiKey = profile.gemini_api_key;
      }

      if (profile && !profile.is_master) {
        const cost = getCreditCost(options.imageSize);
        if ((profile.token_balance ?? 0) < cost) {
          throw new TokenInsufficientError();
        }
      }
    }

    // Generation log 생성
    logId = await createGenerationLog({
      userId: options.userId,
      sessionId: options.sessionId,
      serviceType: "studio",
      action: options.type,
      params: historyParams,
    });

    await updateGenerationLog(logId, { status: "processing" });

    // Gemini API 호출
    // 장미컷은 비용 절감을 위해 gemini-2.5-flash-image로 다운그레이드 테스트
    const roseCutModelOverride =
      options.type === "detail-extract" && options.extractionMode === "rose-cut"
        ? ("gemini-2.5-flash-image" as const)
        : undefined;

    const geminiResult = await callGeminiWithImages(
      prompt,
      images,
      options.mode,
      {
        aspectRatio: options.aspectRatio,
        imageSize: options.imageSize,
      },
      roseCutModelOverride,
      betaApiKey,
    );

    // 결과 이미지 Storage 저장
    const resultBuffer = base64ToBuffer(geminiResult.imageBase64);
    const resultExt =
      geminiResult.mimeType.split("/")[1] === "jpeg"
        ? "jpg"
        : geminiResult.mimeType.split("/")[1];
    const resultPath = getStoragePath("result", options.sessionId, resultExt);
    await supabase.storage.from(BUCKET).upload(resultPath, resultBuffer, {
      contentType: geminiResult.mimeType,
    });
    const { data: resultUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(resultPath);

    // 썸네일 생성 및 업로드
    const thumbBuffer = await generateThumbnail(resultBuffer);
    const thumbPath = getStoragePath("thumb", options.sessionId, "jpg");
    await supabase.storage.from(BUCKET).upload(thumbPath, thumbBuffer, {
      contentType: "image/jpeg",
    });
    const { data: thumbUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(thumbPath);

    const processingTime = Date.now() - startTime;

    // 히스토리 저장
    const { data: historyData } = await supabase
      .from("studio_history")
      .insert({
        session_id: options.sessionId,
        user_id: options.userId,
        type: options.type,
        mode: options.mode,
        source_image_url: sourceUrlData.publicUrl,
        result_image_url: resultUrlData.publicUrl,
        result_thumb_url: thumbUrlData.publicUrl,
        params: historyParams,
        model_used: geminiResult.modelUsed,
        fallback_used: geminiResult.fallbackUsed,
        processing_time: processingTime,
        batch_id: options.batchId || null,
      })
      .select("id")
      .single();

    // 토큰 차감 (마스터 유저와 배치 예약 시에만 스킵)
    let tokensSpent = 0;
    if (historyData?.id && !isMasterUser && !options.skipTokenSpend) {
      try {
        const result = await spendTokensForGeneration(
          supabase,
          options.userId,
          options.imageSize ?? "1K",
          1,
          `${options.type} 이미지 생성`,
          historyData.id,
        );
        tokensSpent = result.spent;
      } catch (spendError) {
        await updateGenerationLog(logId, {
          status: "succeed",
          referenceId: historyData.id,
          errorCode: "SPEND_TOKENS_FAILED",
          errorMessage:
            spendError instanceof Error ? spendError.message : "토큰 차감 실패",
          completedAt: new Date().toISOString(),
        });
        throw spendError;
      }
    }

    await updateGenerationLog(logId, {
      status: "succeed",
      tokensCharged: tokensSpent,
      referenceId: historyData?.id,
      completedAt: new Date().toISOString(),
    });

    return {
      success: true,
      resultImageUrl: resultUrlData.publicUrl,
      historyId: historyData?.id,
      modelUsed: geminiResult.modelUsed,
      fallbackUsed: geminiResult.fallbackUsed,
      processingTime,
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;

    // ValidationError from processors — return as non-retryable failure
    if (error instanceof Error && error.name === "ValidationError") {
      return {
        success: false,
        processingTime,
        error: error.message,
      };
    }

    if (error instanceof TokenInsufficientError) {
      return {
        success: false,
        processingTime,
        error: error.message,
        code: "TOKEN_INSUFFICIENT",
      };
    }

    const errorCode =
      error instanceof StudioError ? error.code : "INTERNAL_ERROR";
    const errorMessage =
      error instanceof Error ? error.message : "서버 오류가 발생했습니다.";

    await updateGenerationLog(logId, {
      status: "failed",
      errorCode,
      errorMessage,
    });

    if (error instanceof StudioError) {
      return {
        success: false,
        processingTime,
        error: error.message,
        code: error.code,
        retryable: error.retryable,
      };
    }

    console.error(`[StudioProcessor] ${options.type} error:`, error instanceof Error ? error.stack : error);
    return {
      success: false,
      processingTime,
      error: errorMessage,
      retryable: true,
    };
  }
}
