"use client";

import { INSTRUCTION_CHIPS } from "@/config/studio";
import { cn } from "@/lib/utils";

interface InstructionChipsProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function InstructionChips({
  selectedIds,
  onToggle,
}: InstructionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {INSTRUCTION_CHIPS.map((chip) => {
        const isSelected = selectedIds.includes(chip.id);
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onToggle(chip.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-muted/50 text-foreground hover:bg-muted hover:border-muted-foreground/30"
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
