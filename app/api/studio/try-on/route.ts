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
import { StudioError } from "@/lib/errors";
import { type GenerationMode, type StudioBaseResponse } from "@/types/studio";

const BUCKET = "studio-images";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const sessionId = await getSessionId();
    const formData = await request.formData();

    const sourceFile = formData.get("sourceImage") as File | null;
    const referenceFile = formData.get("referenceImage") as File | null;
    const mode = (formData.get("mode") as GenerationMode) || "standard";

    if (!sourceFile || !referenceFile) {
      return NextResponse.json(
        {
          success: false,
          error: "원본 이미지와 참조 이미지가 모두 필요합니다.",
        },
        { status: 400 },
      );
    }

    const [sourceProcessed, referenceProcessed] = await Promise.all([
      processImageFile(sourceFile),
      processImageFile(referenceFile),
    ]);

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

    // Gemini API 호출
    const prompt = PROMPTS.tryOn();
    const geminiResult = await callGeminiWithImages(
      prompt,
      [
        { base64: sourceProcessed.base64, mimeType: sourceProcessed.mimeType },
        {
          base64: referenceProcessed.base64,
          mimeType: referenceProcessed.mimeType,
        },
      ],
      mode,
    );

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
        type: "try-on",
        mode,
        source_image_url: sourceUrlData.publicUrl,
        result_image_url: resultUrlData.publicUrl,
        params: {
          sourceImage: sourceUrlData.publicUrl,
          referenceImage: "uploaded",
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

    console.error("Try-on error:", error);
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
