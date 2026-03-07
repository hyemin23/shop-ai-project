"use client";

import { cn } from "@/lib/utils";
import { IMAGE_SIZE_PRESETS, ASPECT_RATIO_PRESETS } from "@/config/studio";
import { CREDIT_COST } from "@/config/pricing";
import { type ImageGenerationOptions } from "@/types/studio";

interface ImageOptionsSelectorProps {
  options: ImageGenerationOptions;
  onOptionsChange: (options: ImageGenerationOptions) => void;
  creditCount?: number;
  creditLabel?: string;
  hideAspectRatio?: boolean;
}

export function ImageOptionsSelector({
  options,
  onOptionsChange,
  creditCount = 1,
  creditLabel,
  hideAspectRatio,
}: ImageOptionsSelectorProps) {
  const selectedSize = options.imageSize ?? "1K";
  const selectedRatio = options.aspectRatio ?? "1:1";
  const unitCost = CREDIT_COST[selectedSize];
  const totalCost = unitCost * creditCount;

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">이미지 생성 옵션</div>

      {!hideAspectRatio && (
        <div>
          <div className="mb-2 text-xs text-muted-foreground">화면 비율</div>
          <div className="inline-flex flex-wrap gap-1 rounded-lg border bg-muted/30 p-1">
            {ASPECT_RATIO_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
                  selectedRatio === preset.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() =>
                  onOptionsChange({ ...options, aspectRatio: preset.value })
                }
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 text-xs text-muted-foreground">해상도</div>
        <div className="inline-flex rounded-lg border bg-muted/30 p-1">
          {IMAGE_SIZE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={cn(
                "rounded-md px-4 py-1.5 text-xs font-medium transition-all duration-200",
                selectedSize === preset.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() =>
                onOptionsChange({ ...options, imageSize: preset.value })
              }
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        {creditCount > 1 ? (
          <>
            {creditCount}개 {creditLabel ?? "이미지"} &times; {unitCost}{" "}
            크레딧 = 총{" "}
            <span className="font-semibold text-foreground">
              {totalCost} 크레딧
            </span>{" "}
            소모
          </>
        ) : creditCount === 1 ? (
          <>
            이 작업은{" "}
            <span className="font-semibold text-foreground">
              {totalCost} 크레딧
            </span>
            이 소모됩니다
          </>
        ) : (
          <>
            {creditLabel ?? "이미지"} 1건당{" "}
            <span className="font-semibold text-foreground">
              {unitCost} 크레딧
            </span>{" "}
            소모
          </>
        )}
      </div>
    </div>
  );
}
