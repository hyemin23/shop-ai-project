"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type UgcGender,
  type UgcAgeGroup,
  type UgcScenePreset,
  UGC_MAX_SCENES,
} from "@/types/ugc";
import {
  getUgcScenesForTarget,
  UGC_SCENE_CATEGORY_LABELS,
} from "@/config/ugc";

interface UgcSceneGridProps {
  gender: UgcGender;
  ageGroup: UgcAgeGroup;
  selectedIds: string[];
  onSelectedChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function UgcSceneGrid({
  gender,
  ageGroup,
  selectedIds,
  onSelectedChange,
  disabled,
}: UgcSceneGridProps) {
  const scenes = useMemo(
    () => getUgcScenesForTarget(gender, ageGroup),
    [gender, ageGroup],
  );

  const groupedScenes = useMemo(() => {
    const groups: Record<string, UgcScenePreset[]> = {};
    for (const scene of scenes) {
      if (!groups[scene.category]) groups[scene.category] = [];
      groups[scene.category].push(scene);
    }
    return groups;
  }, [scenes]);

  const toggleScene = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectedChange(selectedIds.filter((s) => s !== id));
    } else if (selectedIds.length < UGC_MAX_SCENES) {
      onSelectedChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    const allIds = scenes.map((s) => s.id).slice(0, UGC_MAX_SCENES);
    onSelectedChange(allIds);
  };

  const deselectAll = () => {
    onSelectedChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          장소 선택{" "}
          <span className="text-xs font-normal text-muted-foreground">
            ({selectedIds.length}/{UGC_MAX_SCENES})
          </span>
        </label>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={selectAll}
            disabled={disabled}
          >
            전체선택
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={deselectAll}
            disabled={disabled}
          >
            해제
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(groupedScenes).map(([category, categoryScenes]) => (
          <div key={category} className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {UGC_SCENE_CATEGORY_LABELS[category] || category}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {categoryScenes.map((scene) => {
                const isSelected = selectedIds.includes(scene.id);
                const isDisabled =
                  disabled ||
                  (!isSelected && selectedIds.length >= UGC_MAX_SCENES);

                return (
                  <label
                    key={scene.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    } ${isDisabled && !isSelected ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleScene(scene.id)}
                      disabled={isDisabled}
                    />
                    <span className="mr-1">{scene.emoji}</span>
                    <span className="truncate text-xs">{scene.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
