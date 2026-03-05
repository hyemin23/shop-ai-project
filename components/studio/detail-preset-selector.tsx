"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { DETAIL_PRESETS, DEFAULT_4SPLIT_PRESETS } from "@/types/detail-extract";

const MAX_SELECTION = 4;

interface DetailPresetSelectorProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function DetailPresetSelector({
  selectedIds,
  onSelectionChange,
  disabled,
}: DetailPresetSelectorProps) {
  const handleToggle = useCallback(
    (presetId: string) => {
      if (disabled) return;
      const isSelected = selectedIds.includes(presetId);
      if (isSelected) {
        onSelectionChange(selectedIds.filter((id) => id !== presetId));
      } else if (selectedIds.length < MAX_SELECTION) {
        onSelectionChange([...selectedIds, presetId]);
      }
    },
    [selectedIds, onSelectionChange, disabled],
  );

  const handleReset = useCallback(() => {
    onSelectionChange([...DEFAULT_4SPLIT_PRESETS]);
  }, [onSelectionChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          디테일 프리셋 ({selectedIds.length}/{MAX_SELECTION})
        </div>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={handleReset}
          disabled={disabled}
        >
          기본값으로 초기화
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        4개를 선택하세요. 선택 순서대로 좌상 → 우상 → 좌하 → 우하에 배치됩니다.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {DETAIL_PRESETS.map((preset) => {
          const isSelected = selectedIds.includes(preset.id);
          const selectionIndex = selectedIds.indexOf(preset.id);
          const isFull = selectedIds.length >= MAX_SELECTION;

          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled || (!isSelected && isFull)}
              onClick={() => handleToggle(preset.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                isSelected
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border hover:border-primary/50",
                (disabled || (!isSelected && isFull)) && "opacity-50 cursor-not-allowed",
              )}
            >
              {isSelected && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {selectionIndex + 1}
                </span>
              )}
              <span className={cn(!isSelected && "ml-7")}>
                {preset.nameKo}
              </span>
            </button>
          );
        })}
      </div>
      {selectedIds.length === MAX_SELECTION && (
        <div className="flex gap-1 text-xs text-muted-foreground">
          <span className="font-medium">배치:</span>
          {selectedIds.map((id, i) => {
            const preset = DETAIL_PRESETS.find((p) => p.id === id);
            const positions = ["좌상", "우상", "좌하", "우하"];
            return (
              <span key={id}>
                {positions[i]}={preset?.nameKo}
                {i < 3 && ","}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
