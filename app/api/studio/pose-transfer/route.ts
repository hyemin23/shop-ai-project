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
  const poseType = formData.get("poseType") as "preset" | "custom" | null;
  const presetId = formData.get("presetId") as string | null;
  const poseReferenceFile = formData.get("poseReferenceImage") as File | null;
  const mode = (formData.get("mode") as GenerationMode) || "standard";
  const aspectRatio = parseAspectRatio(formData.get("aspectRatio"));
  const imageSize = parseImageSize(formData.get("imageSize"));
  const userPrompt = formData.get("userPrompt") as string | null;

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

  const result = await processSingleStudioRequest({
    type: "pose-transfer",
    mode,
    sourceFile,
    poseType,
    presetId: presetId || undefined,
    poseReferenceFile,
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
