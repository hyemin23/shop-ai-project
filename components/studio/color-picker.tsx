"use client";

import { Input } from "@/components/ui/input";
import { COLOR_PRESETS } from "@/config/studio";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  selectedColor?: string;
  onColorSelect?: (hex: string) => void;
}

export function ColorPicker({
  selectedColor,
  onColorSelect,
}: ColorPickerProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">색상 선택</p>

      {/* 프리셋 그리드 */}
      <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            className={cn("flex flex-col items-center gap-1")}
            onClick={() => onColorSelect?.(preset.hex)}
          >
            <div
              className={cn(
                "h-10 w-10 rounded-full border-2 transition-all",
                selectedColor === preset.hex &&
                  "ring-2 ring-primary ring-offset-2",
              )}
              style={{ backgroundColor: preset.hex }}
            />
            <span className="text-xs text-center">{preset.nameKo}</span>
          </button>
        ))}
      </div>

      {/* HEX 입력 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">#</span>
        <Input placeholder="000000" maxLength={6} className="font-mono" />
      </div>

      {/* 선택된 색상 프리뷰 */}
      <div className="flex items-center gap-3">
        <div
          className="h-8 w-8 rounded border"
          style={{ backgroundColor: selectedColor || "#000000" }}
        />
        <span className="text-sm text-muted-foreground">
          {selectedColor || "#000000"}
        </span>
      </div>
    </div>
  );
}
