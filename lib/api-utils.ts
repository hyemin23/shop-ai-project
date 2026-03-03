import { NextResponse } from "next/server";
import { ASPECT_RATIO_PRESETS, IMAGE_SIZE_PRESETS } from "@/config/studio";
import type { ProcessResult } from "@/lib/studio-processor";
import type { AspectRatio, ImageSize } from "@/types/studio";

const ERROR_STATUS_MAP: Record<string, number> = {
  TOKEN_INSUFFICIENT: 402,
  FREE_TRIAL_EXCEEDED: 403,
  STUDIO_004: 504,
  STUDIO_005: 429,
  STUDIO_006: 502,
};

export function studioErrorResponse(result: ProcessResult): NextResponse {
  const status =
    result.code && result.code in ERROR_STATUS_MAP
      ? ERROR_STATUS_MAP[result.code]
      : 400;
  return NextResponse.json(result, { status });
}

const VALID_ASPECT_RATIOS = new Set(ASPECT_RATIO_PRESETS.map((p) => p.value));
const VALID_IMAGE_SIZES = new Set(IMAGE_SIZE_PRESETS.map((p) => p.value));

export function parseAspectRatio(
  value: FormDataEntryValue | null,
): AspectRatio | undefined {
  return VALID_ASPECT_RATIOS.has(value as AspectRatio)
    ? (value as AspectRatio)
    : undefined;
}

export function parseImageSize(
  value: FormDataEntryValue | null,
): ImageSize | undefined {
  return VALID_IMAGE_SIZES.has(value as ImageSize)
    ? (value as ImageSize)
    : undefined;
}
