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
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
