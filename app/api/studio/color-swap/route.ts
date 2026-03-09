import { NextResponse, type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { processSingleStudioRequest } from "@/lib/studio-processor";
import {
  studioErrorResponse,
  parseAspectRatio,
  parseImageSize,
} from "@/lib/api-utils";
import { resolveMode } from "@/config/studio";

export async function POST(request: NextRequest) {
  const { userId, sessionId } = await getUserOrSessionId();
  const formData = await request.formData();

  const sourceFile = formData.get("sourceImage") as File | null;
  const targetColor = formData.get("targetColor") as string | null;
  const referenceFile = formData.get("referenceImage") as File | null;
  const garmentRegion = (formData.get("garmentRegion") as string) || "auto";
  const imageSize = parseImageSize(formData.get("imageSize"));
  const mode = resolveMode(imageSize);
  const aspectRatio = parseAspectRatio(formData.get("aspectRatio"));
  const userPrompt = formData.get("userPrompt") as string | null;

  if (!sourceFile || (!targetColor && !referenceFile)) {
    return NextResponse.json(
      {
        success: false,
        error: "원본 이미지와 목표 색상(또는 참조 이미지)이 필요합니다.",
      },
      { status: 400 },
    );
  }

  const result = await processSingleStudioRequest({
    type: "color-swap",
    mode,
    sourceFile,
    referenceFile: referenceFile || undefined,
    targetColor: targetColor || undefined,
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
