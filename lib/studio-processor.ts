import { createServiceClient } from "@/lib/supabase/server";
import { callGeminiWithImages } from "@/lib/gemini";
import {
  processImageFile,
  getStoragePath,
  base64ToBuffer,
} from "@/lib/image-utils";
import { PROMPTS } from "@/config/prompts";
import { POSE_PRESETS } from "@/config/studio";
import {
  spendTokensForGeneration,
  checkFreeTrialLimit,
  TokenInsufficientError,
} from "@/lib/tokens";
import { StudioError } from "@/lib/errors";
import { type GenerationMode, type StudioType } from "@/types/studio";

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
  userId: string | null;
  sessionId: string;
  batchId?: string;
  skipTrialCheck?: boolean;
}

export async function processSingleStudioRequest(
  options: ProcessOptions,
): Promise<ProcessResult> {
  const startTime = Date.now();

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
      .upload(sourcePath, sourceProcessed.buffer, {
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
        prompt = PROMPTS.tryOn();
        historyParams.referenceImage = "uploaded";
        break;
      }
      case "color-swap": {
        if (!options.targetColor) {
          return {
            success: false,
            processingTime: Date.now() - startTime,
            error: "목표 색상이 필요합니다.",
          };
        }
        const garmentTypeMap: Record<string, string> = {
          auto: "clothing",
          top: "upper body clothing (top/shirt/jacket)",
          bottom: "lower body clothing (pants/skirt)",
          dress: "dress/one-piece",
        };
        const region = options.garmentRegion || "auto";
        prompt = PROMPTS.colorSwap(
          options.targetColor,
          garmentTypeMap[region] || "clothing",
        );
        historyParams.targetColor = options.targetColor;
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
        prompt = PROMPTS.poseTransfer(poseDescription);
        historyParams.poseType = options.poseType;
        if (options.presetId) historyParams.presetId = options.presetId;
        if (options.poseType === "custom")
          historyParams.poseReferenceImage = "uploaded";
        break;
      }
    }

    // Gemini API 호출
    const geminiResult = await callGeminiWithImages(
      prompt,
      images,
      options.mode,
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
        params: historyParams,
        model_used: geminiResult.modelUsed,
        fallback_used: geminiResult.fallbackUsed,
        processing_time: processingTime,
        batch_id: options.batchId || null,
      })
      .select("id")
      .single();

    // 토큰 차감
    const actualMode = geminiResult.fallbackUsed ? "standard" : options.mode;
    if (historyData?.id) {
      await spendTokensForGeneration(
        supabase,
        options.userId,
        options.type,
        options.mode,
        actualMode as GenerationMode,
        historyData.id,
      );
    }

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

    if (error instanceof StudioError) {
      return {
        success: false,
        processingTime,
        error: error.message,
        code: error.code,
        retryable: error.retryable,
      };
    }

    console.error(`${options.type} processing error:`, error);
    return {
      success: false,
      processingTime,
      error: "서버 오류가 발생했습니다.",
      retryable: true,
    };
  }
}
