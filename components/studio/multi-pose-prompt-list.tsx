"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MAX_POSE_VARIATIONS,
} from "@/types/multi-pose";
import { PROMPT_CONSTRAINTS, PROMPT_PLACEHOLDERS } from "@/config/studio";

interface MultiPosePromptListProps {
  prompts: string[];
  onChange: (prompts: string[]) => void;
  disabled?: boolean;
}

const PLACEHOLDER_EXAMPLES = [
  "정면을 바라보며 자연스럽게 서 있는 포즈",
  "왼쪽 측면을 보여주는 서 있는 포즈",
  "한 손을 허리에 올린 자신감 있는 포즈",
  "자연스럽게 걷고 있는 동적인 포즈",
  "양손을 주머니에 넣은 캐주얼한 포즈",
];

export function MultiPosePromptList({
  prompts,
  onChange,
  disabled = false,
}: MultiPosePromptListProps) {
  const maxLength = PROMPT_CONSTRAINTS.maxLength;
  const filledCount = prompts.filter((p) => p.trim()).length;

  const handleChange = (index: number, value: string) => {
    if (value.length > maxLength) return;
    const updated = [...prompts];
    updated[index] = value;
    onChange(updated);
  };

  const handleClearAll = () => {
    onChange(Array(MAX_POSE_VARIATIONS).fill(""));
  };

  return (
    <div className={cn("space-y-3", disabled && "pointer-events-none opacity-50")}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          포즈 설명 ({filledCount}/{MAX_POSE_VARIATIONS})
        </span>
        {filledCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={handleClearAll}
          >
            <X className="mr-1 h-3 w-3" />
            전체 클리어
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {prompts.slice(0, MAX_POSE_VARIATIONS).map((prompt, index) => {
          const charCount = prompt.length;
          const isFilled = prompt.trim().length > 0;

          return (
            <div key={index} className="flex gap-2">
              <Badge
                variant={isFilled ? "default" : "outline"}
                className="mt-2 h-6 w-6 shrink-0 justify-center rounded-full p-0 text-xs"
              >
                {index + 1}
              </Badge>
              <div className="flex-1 space-y-1">
                <Textarea
                  placeholder={
                    PLACEHOLDER_EXAMPLES[index] ||
                    PROMPT_PLACEHOLDERS["multi-pose"]
                  }
                  value={prompt}
                  onChange={(e) => handleChange(index, e.target.value)}
                  disabled={disabled}
                  rows={2}
                  className="resize-none text-sm"
                />
                {charCount > 0 && (
                  <p
                    className={cn(
                      "text-right text-xs tabular-nums",
                      charCount / maxLength >= 0.9
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {charCount}/{maxLength}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        빈 프롬프트는 건너뛰고, 입력된 변형만 생성됩니다.
      </p>
    </div>
  );
}
