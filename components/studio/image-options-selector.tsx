"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASPECT_RATIO_PRESETS, IMAGE_SIZE_PRESETS } from "@/config/studio";
import { type ImageGenerationOptions } from "@/types/studio";

interface ImageOptionsSelectorProps {
  options: ImageGenerationOptions;
  onOptionsChange: (options: ImageGenerationOptions) => void;
}

export function ImageOptionsSelector({
  options,
  onOptionsChange,
}: ImageOptionsSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">이미지 생성 옵션</div>
      <div className="grid grid-cols-2 gap-3">
        {/* 비율 */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">비율</div>
          <Select
            value={options.aspectRatio ?? "1:1"}
            onValueChange={(value) =>
              onOptionsChange({
                ...options,
                aspectRatio: value as ImageGenerationOptions["aspectRatio"],
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASPECT_RATIO_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 해상도 */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">해상도</div>
          <Select
            value={options.imageSize ?? "1k"}
            onValueChange={(value) =>
              onOptionsChange({
                ...options,
                imageSize: value as ImageGenerationOptions["imageSize"],
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMAGE_SIZE_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
