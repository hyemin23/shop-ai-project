import { type NextRequest, NextResponse } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { processSingleStudioRequest } from "@/lib/studio-processor";
import { AUTO_FITTING_PRESETS } from "@/config/auto-fitting";
import { type ImageSize, type GenerationMode } from "@/types/studio";
import { resolveMode } from "@/config/studio";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const { userId, sessionId } = await getUserOrSessionId();
  const formData = await request.formData();

  const sourceImage = formData.get("sourceImage") as File | null;
  const presetId = formData.get("presetId") as string | null;
  const imageSize = (formData.get("imageSize") as ImageSize) || "1K";
  const mode: GenerationMode = resolveMode(imageSize);
  const stylePrompt =
    (formData.get("stylePrompt") as string)?.trim() || undefined;

  if (!sourceImage || !presetId) {
    return NextResponse.json(
      { error: "소스 이미지와 포즈 ID가 필요합니다." },
      { status: 400 },
    );
  }

  const preset = AUTO_FITTING_PRESETS.find((p) => p.id === presetId);
  if (!preset) {
    return NextResponse.json(
      { error: "유효하지 않은 포즈입니다." },
      { status: 400 },
    );
  }

  const result = await processSingleStudioRequest({
    type: "auto-fitting",
    mode,
    sourceFile: sourceImage,
    userId,
    sessionId,
    aspectRatio: "1:1",
    imageSize: imageSize as "1K" | "2K" | "4K",
    userPrompt: preset.description,
    autoFittingStylePrompt: stylePrompt,
  });

  if (!result.success) {
    const status = result.code === "TOKEN_INSUFFICIENT" ? 402 : 500;
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status },
    );
  }

  return NextResponse.json({
    resultImageUrl: result.resultImageUrl,
    processingTime: result.processingTime,
  });
}
