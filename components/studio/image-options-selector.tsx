"use client";

import { cn } from "@/lib/utils";
import { IMAGE_SIZE_PRESETS } from "@/config/studio";
import { type ImageGenerationOptions } from "@/types/studio";

interface ImageOptionsSelectorProps {
  options: ImageGenerationOptions;
  onOptionsChange: (options: ImageGenerationOptions) => void;
}

export function ImageOptionsSelector({
  options,
  onOptionsChange,
}: ImageOptionsSelectorProps) {
  const selectedSize = options.imageSize ?? "1K";

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">이미지 생성 옵션</div>

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
    </div>
  );
}
