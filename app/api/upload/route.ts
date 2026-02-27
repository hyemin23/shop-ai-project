import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { processImageFile, getStoragePath } from "@/lib/image-utils";
import { getSessionId } from "@/lib/session";
import { StudioError } from "@/lib/errors";

const BUCKET = "studio-images";

export async function POST(request: NextRequest) {
  try {
    const sessionId = await getSessionId();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 필요합니다." },
        { status: 400 },
      );
    }

    const processed = await processImageFile(file);
    const storagePath = getStoragePath(
      "source",
      sessionId,
      processed.extension,
    );
    const supabase = createServiceClient();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, processed.buffer, {
        contentType: processed.mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        {
          error: "이미지 업로드에 실패했습니다.",
          detail: uploadError.message,
        },
        { status: 500 },
      );
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: storagePath,
      base64: processed.base64,
      mimeType: processed.mimeType,
      sessionId,
    });
  } catch (error) {
    if (error instanceof StudioError) {
      return NextResponse.json(
        { error: error.message, code: error.code, retryable: error.retryable },
        { status: 400 },
      );
    }

    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
