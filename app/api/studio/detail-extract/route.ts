import { NextResponse, type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { processSingleStudioRequest } from "@/lib/studio-processor";
import {
  studioErrorResponse,
  parseAspectRatio,
  parseImageSize,
} from "@/lib/api-utils";
import { resolveMode } from "@/config/studio";
import { type DetailExtractMode } from "@/types/detail-extract";

export async function POST(request: NextRequest) {
  const { userId, sessionId } = await getUserOrSessionId();
  const formData = await request.formData();

  const sourceFile = formData.get("sourceImage") as File | null;
  const extractionMode = (formData.get("extractionMode") as DetailExtractMode) || "rose-cut";
  const imageSize = parseImageSize(formData.get("imageSize"));
  const mode = resolveMode(imageSize);
  const aspectRatio = parseAspectRatio(formData.get("aspectRatio"));
  const userPrompt = formData.get("userPrompt") as string | null;

  if (!sourceFile) {
    return NextResponse.json(
      { success: false, error: "원본 이미지가 필요합니다." },
      { status: 400 },
    );
  }

  // 4분할컷 프리셋 수집
  let detailPresets: string[] | undefined;
  if (extractionMode === "4-split") {
    const presets: string[] = [];
    for (let i = 0; i < 4; i++) {
      const preset = formData.get(`preset_${i}`) as string | null;
      if (preset) presets.push(preset);
    }
    if (presets.length !== 4) {
      return NextResponse.json(
        { success: false, error: "4분할컷은 4개의 디테일 프리셋이 필요합니다." },
        { status: 400 },
      );
    }
    detailPresets = presets;
  }

  const result = await processSingleStudioRequest({
    type: "detail-extract",
    mode,
    sourceFile,
    extractionMode,
    detailPresets,
    userId,
    sessionId,
    aspectRatio,
    imageSize,
    userPrompt: userPrompt || undefined,
  });

  if (!result.success) {
    return studioErrorResponse(result);
  }

  return NextResponse.json(result);
}
