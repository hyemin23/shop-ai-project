import { NextResponse, type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { processSingleStudioRequest } from "@/lib/studio-processor";
import { type GenerationMode } from "@/types/studio";

export async function POST(request: NextRequest) {
  const { userId, sessionId } = await getUserOrSessionId();
  const formData = await request.formData();

  const sourceFile = formData.get("sourceImage") as File | null;
  const targetColor = formData.get("targetColor") as string | null;
  const garmentRegion = (formData.get("garmentRegion") as string) || "auto";
  const mode = (formData.get("mode") as GenerationMode) || "standard";

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
