import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { callGeminiWithImages } from "@/lib/gemini";
import { getSessionId } from "@/lib/session";
import {
  processImageFile,
  getStoragePath,
  base64ToBuffer,
} from "@/lib/image-utils";
import { PROMPTS } from "@/config/prompts";
import { POSE_PRESETS } from "@/config/studio";
import { StudioError } from "@/lib/errors";
import { type GenerationMode, type StudioBaseResponse } from "@/types/studio";

const BUCKET = "studio-images";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const sessionId = await getSessionId();
    const formData = await request.formData();

    const sourceFile = formData.get("sourceImage") as File | null;
    const poseType = formData.get("poseType") as "preset" | "custom" | null;
    const presetId = formData.get("presetId") as string | null;
    const poseReferenceFile = formData.get("poseReferenceImage") as File | null;
    const mode = (formData.get("mode") as GenerationMode) || "standard";

    if (!sourceFile) {
      return NextResponse.json(
        { success: false, error: "원본 이미지가 필요합니다." },
        { status: 400 },
      );
    }

    if (
      !poseType ||
      (poseType === "preset" && !presetId) ||
      (poseType === "custom" && !poseReferenceFile)
    ) {
      return NextResponse.json(
        { success: false, error: "포즈 타입과 관련 정보가 필요합니다." },
        { status: 400 },
      );
    }

    const sourceProcessed = await processImageFile(sourceFile);
    const supabase = createServiceClient();

    // 원본 이미지 Storage 저장
    const sourcePath = getStoragePath(
      "source",
      sessionId,
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

    let poseDescription: string;
    if (poseType === "preset") {
      const preset = POSE_PRESETS.find((p) => p.id === presetId);
      if (!preset) {
        return NextResponse.json(
          { success: false, error: "유효하지 않은 포즈 프리셋입니다." },
          { status: 400 },
        );
      }
      poseDescription = preset.description;
    } else {
      const poseRefProcessed = await processImageFile(poseReferenceFile!);
      images.push({
        base64: poseRefProcessed.base64,
        mimeType: poseRefProcessed.mimeType,
      });
      poseDescription =
        "Match the pose shown in the reference pose image exactly.";
    }

    const prompt = PROMPTS.poseTransfer(poseDescription);
    const geminiResult = await callGeminiWithImages(prompt, images, mode);

    // 결과 이미지 Storage 저장
    const resultBuffer = base64ToBuffer(geminiResult.imageBase64);
    const resultExt =
      geminiResult.mimeType.split("/")[1] === "jpeg"
        ? "jpg"
        : geminiResult.mimeType.split("/")[1];
    const resultPath = getStoragePath("result", sessionId, resultExt);
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
        session_id: sessionId,
        type: "pose-transfer",
        mode,
        source_image_url: sourceUrlData.publicUrl,
        result_image_url: resultUrlData.publicUrl,
        params: {
          sourceImage: sourceUrlData.publicUrl,
          poseType,
          presetId: presetId || undefined,
          poseReferenceImage: poseType === "custom" ? "uploaded" : undefined,
        },
        model_used: geminiResult.modelUsed,
        fallback_used: geminiResult.fallbackUsed,
        processing_time: processingTime,
      })
      .select("id")
      .single();

    const response: StudioBaseResponse = {
      success: true,
      resultImageUrl: resultUrlData.publicUrl,
      historyId: historyData?.id,
      modelUsed: geminiResult.modelUsed as StudioBaseResponse["modelUsed"],
      fallbackUsed: geminiResult.fallbackUsed,
      processingTime,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof StudioError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          retryable: error.retryable,
          processingTime: Date.now() - startTime,
        },
        { status: 400 },
      );
    }

    console.error("Pose-transfer error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "서버 오류가 발생했습니다.",
        processingTime: Date.now() - startTime,
      },
      { status: 500 },
    );
  }
}
