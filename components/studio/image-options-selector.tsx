"use client";

import { Button } from "@/components/ui/button";
import { IMAGE_SIZE_PRESETS } from "@/config/studio";
import { cn } from "@/lib/utils";
import { type ImageGenerationOptions } from "@/types/studio";

interface ImageOptionsSelectorProps {
  options: ImageGenerationOptions;
  onOptionsChange: (options: ImageGenerationOptions) => void;
}

export function ImageOptionsSelector({
  options,
  onOptionsChange,
}: ImageOptionsSelectorProps) {
  // 현재 선택된 해상도 값 (기본값: 1k)
  const selectedSize = options.imageSize ?? "1k";

  return (
    <div className="space-y-3">
      {/* 섹션 타이틀 */}
      <div className="text-sm font-medium">이미지 생성 옵션</div>

      {/* 해상도 버튼 그룹 */}
      <div>
        <div className="text-xs text-muted-foreground mb-1.5">해상도</div>
        <div className="flex gap-2">
          {IMAGE_SIZE_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant={selectedSize === preset.value ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 px-3 text-xs font-medium",
                // 미선택 버튼 다크모드 호환
                selectedSize !== preset.value &&
                  "dark:border-border dark:text-muted-foreground dark:hover:text-foreground"
              )}
              onClick={() =>
                onOptionsChange({ ...options, imageSize: preset.value })
              }
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
