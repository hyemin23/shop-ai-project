"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { PROMPT_CONSTRAINTS, PROMPT_PLACEHOLDERS } from "@/config/studio";

interface PromptInputProps {
  mode: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PromptInput({
  mode,
  value,
  onChange,
  disabled = false,
}: PromptInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const placeholder = PROMPT_PLACEHOLDERS[mode] ?? "";
  const charCount = value.length;
  const maxLength = PROMPT_CONSTRAINTS.maxLength;
  const ratio = charCount / maxLength;
  const isNearLimit = ratio >= 0.9;

  return (
    <div className={cn("space-y-2", disabled && "opacity-50")}>
      {/* Label */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-200",
            isFocused
              ? "bg-primary/15 text-primary"
              : "bg-muted/60 text-muted-foreground",
          )}
        >
          <Wand2 className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-medium">AI 지시사항</span>
      </div>

      {/* Textarea container */}
      <div
        className={cn(
          "overflow-hidden rounded-xl border transition-all duration-200",
          isFocused
            ? "border-primary/40 ring-[3px] ring-primary/10"
            : "border-border",
        )}
      >
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            const next = e.target.value;
            if (next.length <= maxLength) onChange(next);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          rows={3}
          className="resize-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
        />

        {/* Progress bar + counter */}
        <div className="flex items-center gap-3 border-t border-border/50 px-3 py-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/50">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                isNearLimit
                  ? "bg-amber-500 dark:bg-amber-400"
                  : "bg-primary/30",
              )}
              style={{ width: `${Math.min(ratio * 100, 100)}%` }}
            />
          </div>
          <span
            className={cn(
              "shrink-0 text-xs tabular-nums transition-colors duration-300",
              isNearLimit
                ? "font-medium text-amber-600 dark:text-amber-400"
                : "text-muted-foreground",
            )}
          >
            {charCount}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
}
