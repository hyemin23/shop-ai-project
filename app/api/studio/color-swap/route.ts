import { NextResponse, type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { processSingleStudioRequest } from "@/lib/studio-processor";
import {
  studioErrorResponse,
  parseAspectRatio,
  parseImageSize,
} from "@/lib/api-utils";
import { type GenerationMode } from "@/types/studio";

export async function POST(request: NextRequest) {
  const { userId, sessionId } = await getUserOrSessionId();
  const formData = await request.formData();

  const sourceFile = formData.get("sourceImage") as File | null;
  const targetColor = formData.get("targetColor") as string | null;
  const garmentRegion = (formData.get("garmentRegion") as string) || "auto";
  const mode = (formData.get("mode") as GenerationMode) || "standard";
  const aspectRatio = parseAspectRatio(formData.get("aspectRatio"));
  const imageSize = parseImageSize(formData.get("imageSize"));
  const userPrompt = formData.get("userPrompt") as string | null;

  if (!sourceFile || !targetColor) {
    return NextResponse.json(
      { success: false, error: "원본 이미지와 목표 색상이 필요합니다." },
      { status: 400 },
    );
  }

  const result = await processSingleStudioRequest({
    type: "color-swap",
    mode,
    sourceFile,
    targetColor,
    garmentRegion,
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
