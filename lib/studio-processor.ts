import { createServiceClient } from "@/lib/supabase/server";
import { callGeminiWithImages } from "@/lib/gemini";
import {
  processImageFile,
  getStoragePath,
  base64ToBuffer,
  generateThumbnail,
} from "@/lib/image-utils";
import { PROMPTS } from "@/config/prompts";
import { POSE_PRESETS } from "@/config/studio";
import { DETAIL_PRESETS, DEFAULT_4SPLIT_PRESETS } from "@/types/detail-extract";
import {
  spendTokensForGeneration,
  checkFreeTrialLimit,
  getCreditCost,
  TokenInsufficientError,
} from "@/lib/tokens";
import { StudioError } from "@/lib/errors";
import { createGenerationLog, updateGenerationLog } from "@/lib/generation-log";
import {
  type GenerationMode,
  type StudioType,
  type AspectRatio,
  type ImageSize,
} from "@/types/studio";

const BUCKET = "studio-images";

export interface ProcessResult {
  success: boolean;
  resultImageUrl?: string;
  historyId?: string;
  modelUsed?: string;
  fallbackUsed?: boolean;
  processingTime: number;
  error?: string;
  code?: string;
  retryable?: boolean;
}

interface ProcessOptions {
  type: StudioType;
  mode: GenerationMode;
  sourceFile: File;
  referenceFile?: File | null;
  targetColor?: string;
  garmentRegion?: string;
  poseType?: "preset" | "custom";
  presetId?: string;
  poseReferenceFile?: File | null;
  extractionMode?: "rose-cut" | "4-split" | "nukki";
  detailPresets?: string[];
  garmentCategory?: string;
  autoFittingStylePrompt?: string;
  ugcGender?: string;
  ugcAgeGroup?: string;
  ugcSceneDescription?: string;
  userId: string | null;
  sessionId: string;
  batchId?: string;
  skipTrialCheck?: boolean;
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  userPrompt?: string;
  /** Skip individual token spend when tokens are pre-reserved at batch level */
  skipTokenSpend?: boolean;
}

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

    // 프롬프트 및 이미지 준비
    const images: { base64: string; mimeType: string }[] = [
      { base64: sourceProcessed.base64, mimeType: sourceProcessed.mimeType },
    ];
    let prompt: string;
    const historyParams: Record<string, unknown> = {
      sourceImage: sourceUrlData.publicUrl,
    };

    if (options.userPrompt?.trim()) {
      historyParams.userPrompt = options.userPrompt.trim();
    }

    switch (options.type) {
      case "try-on": {
        if (!options.referenceFile) {
          return {
            success: false,
            processingTime: Date.now() - startTime,
            error: "참조 이미지가 필요합니다.",
          };
        }
        const refProcessed = await processImageFile(options.referenceFile);
        images.push({
          base64: refProcessed.base64,
          mimeType: refProcessed.mimeType,
        });
        prompt = PROMPTS.tryOn(options.garmentCategory || undefined, options.userPrompt);
        historyParams.referenceImage = "uploaded";
        break;
      }
      case "color-swap": {
        const garmentTypeMap: Record<string, string> = {
          auto: "clothing",
          top: "upper body clothing (top/shirt/jacket)",
          bottom: "lower body clothing (pants/skirt)",
          dress: "dress/one-piece",
        };
        const region = options.garmentRegion || "auto";
        const garmentLabel = garmentTypeMap[region] || "clothing";

        if (options.referenceFile) {
          // 참조 이미지 모드
          const refProcessed = await processImageFile(options.referenceFile);
          images.push({
            base64: refProcessed.base64,
            mimeType: refProcessed.mimeType,
          });
          prompt = PROMPTS.colorSwapFromReference(
            garmentLabel,
            options.userPrompt,
          );
          historyParams.colorMode = "reference";
          historyParams.colorReferenceImage = "uploaded";
        } else {
          // 기존 HEX 색상 모드
          if (!options.targetColor) {
            return {
              success: false,
              processingTime: Date.now() - startTime,
              error: "목표 색상이 필요합니다.",
            };
          }
          prompt = PROMPTS.colorSwap(
            options.targetColor,
            garmentLabel,
            options.userPrompt,
          );
          historyParams.targetColor = options.targetColor;
          historyParams.colorMode = "hex";
        }
        historyParams.garmentRegion = region;
        break;
      }
      case "pose-transfer": {
        let poseDescription: string;
        if (options.poseType === "preset") {
          const preset = POSE_PRESETS.find((p) => p.id === options.presetId);
          if (!preset) {
            return {
              success: false,
              processingTime: Date.now() - startTime,
              error: "유효하지 않은 포즈 프리셋입니다.",
            };
          }
          poseDescription = preset.description;
        } else {
          if (!options.poseReferenceFile) {
            return {
              success: false,
              processingTime: Date.now() - startTime,
              error: "포즈 참조 이미지가 필요합니다.",
            };
          }
          const poseRefProcessed = await processImageFile(
            options.poseReferenceFile,
          );
          images.push({
            base64: poseRefProcessed.base64,
            mimeType: poseRefProcessed.mimeType,
          });
          poseDescription =
            "Match the pose shown in the reference pose image exactly.";
        }
        prompt = PROMPTS.poseTransfer(poseDescription, options.userPrompt);
        historyParams.poseType = options.poseType;
        if (options.presetId) historyParams.presetId = options.presetId;
        if (options.poseType === "custom")
          historyParams.poseReferenceImage = "uploaded";
        break;
      }
      case "multi-pose": {
        if (!options.userPrompt?.trim()) {
          return {
            success: false,
            processingTime: Date.now() - startTime,
            error: "포즈 설명이 필요합니다.",
          };
        }
        prompt = PROMPTS.poseTransfer(
          options.userPrompt.trim(),
        );
        historyParams.poseDescription = options.userPrompt.trim();
        break;
      }
      case "background-swap": {
        if (!options.referenceFile) {
          return {
            success: false,
            processingTime: Date.now() - startTime,
            error: "배경 이미지가 필요합니다.",
          };
        }
        const bgRefProcessed = await processImageFile(options.referenceFile);
        images.push({
          base64: bgRefProcessed.base64,
          mimeType: bgRefProcessed.mimeType,
        });
        prompt = PROMPTS.backgroundSwap(options.userPrompt);
        historyParams.backgroundReferenceImage = "uploaded";
        break;
      }
      case "auto-fitting": {
        const poseDesc = options.userPrompt?.trim();
        if (!poseDesc) {
          return {
            success: false,
            processingTime: Date.now() - startTime,
            error: "포즈 설명이 필요합니다.",
          };
        }
        prompt = PROMPTS.autoFitting(poseDesc, options.autoFittingStylePrompt);
        historyParams.autoFittingPose = poseDesc;
        if (options.autoFittingStylePrompt) {
          historyParams.stylePrompt = options.autoFittingStylePrompt;
        }
        break;
      }
      case "detail-extract": {
        const extractionMode = options.extractionMode || "rose-cut";
        if (extractionMode === "rose-cut") {
          prompt = PROMPTS.roseCut(options.userPrompt);
        } else if (extractionMode === "nukki") {
          prompt = PROMPTS.nukkiCut(options.userPrompt);
        } else {
          const details = options.detailPresets ||
            DEFAULT_4SPLIT_PRESETS.map(
              (id) => DETAIL_PRESETS.find((p) => p.id === id)!.description,
            );
          prompt = PROMPTS.fourSplitCut(details, options.userPrompt);
        }
        historyParams.extractionMode = extractionMode;
        if (options.detailPresets) historyParams.detailPresets = options.detailPresets;
        break;
      }
      case "ugc": {
        if (!options.ugcSceneDescription) {
          return {
            success: false,
            processingTime: Date.now() - startTime,
            error: "장면 설명이 필요합니다.",
          };
        }
        prompt = PROMPTS.ugcGenerate(
          options.ugcGender || "female",
          options.ugcAgeGroup || "20s",
          options.ugcSceneDescription,
          options.userPrompt,
        );
        historyParams.ugcGender = options.ugcGender;
        historyParams.ugcAgeGroup = options.ugcAgeGroup;
        historyParams.ugcScene = options.ugcSceneDescription;
        break;
      }
    }

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
