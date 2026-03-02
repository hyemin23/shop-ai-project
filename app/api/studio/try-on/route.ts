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
  const referenceFile = formData.get("referenceImage") as File | null;
  const mode = (formData.get("mode") as GenerationMode) || "standard";
  const aspectRatio = parseAspectRatio(formData.get("aspectRatio"));
  const imageSize = parseImageSize(formData.get("imageSize"));

  if (!sourceFile || !referenceFile) {
    return NextResponse.json(
      {
        success: false,
        error: "원본 이미지와 참조 이미지가 모두 필요합니다.",
      },
      { status: 400 },
    );
  }

  const result = await processSingleStudioRequest({
    type: "try-on",
    mode,
    sourceFile,
    referenceFile,
    userId,
    sessionId,
    aspectRatio,
    imageSize,
  });

  if (!result.success) {
    return studioErrorResponse(result);
  }

  return NextResponse.json(result);
}
