import { NextResponse, type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { processSingleStudioRequest } from "@/lib/studio-processor";
import { type GenerationMode } from "@/types/studio";

export async function POST(request: NextRequest) {
  const { userId, sessionId } = await getUserOrSessionId();
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

  const result = await processSingleStudioRequest({
    type: "pose-transfer",
    mode,
    sourceFile,
    poseType,
    presetId: presetId || undefined,
    poseReferenceFile,
    userId,
    sessionId,
  });

  if (!result.success) {
    const status =
      result.code === "TOKEN_INSUFFICIENT"
        ? 402
        : result.code === "FREE_TRIAL_EXCEEDED"
          ? 403
          : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
