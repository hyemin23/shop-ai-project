"use client";

import { cn } from "@/lib/utils";
import { type UgcGender, type UgcAgeGroup } from "@/types/ugc";

const GENDER_OPTIONS: { value: UgcGender; label: string }[] = [
  { value: "female", label: "여성" },
  { value: "male", label: "남성" },
];

const AGE_OPTIONS: { value: UgcAgeGroup; label: string }[] = [
  { value: "10s", label: "10대" },
  { value: "20s", label: "20대" },
  { value: "30s", label: "30대" },
  { value: "40s+", label: "40대+" },
];

interface UgcTargetSelectorProps {
  gender: UgcGender;
  ageGroup: UgcAgeGroup;
  onGenderChange: (gender: UgcGender) => void;
  onAgeGroupChange: (ageGroup: UgcAgeGroup) => void;
  disabled?: boolean;
}

export function UgcTargetSelector({
  gender,
  ageGroup,
  onGenderChange,
  onAgeGroupChange,
  disabled,
}: UgcTargetSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">타겟 설정</label>
      <div className="flex flex-wrap items-center gap-3">
        {/* 성별 세그먼트 */}
        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">성별</div>
          <div className="inline-flex rounded-lg border bg-muted/30 p-1">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                className={cn(
                  "rounded-md px-4 py-1.5 text-xs font-medium transition-all duration-200",
                  gender === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                  disabled && "pointer-events-none opacity-50",
                )}
                onClick={() => onGenderChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 연령대 세그먼트 */}
        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">연령대</div>
          <div className="inline-flex rounded-lg border bg-muted/30 p-1">
            {AGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                className={cn(
                  "rounded-md px-4 py-1.5 text-xs font-medium transition-all duration-200",
                  ageGroup === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                  disabled && "pointer-events-none opacity-50",
                )}
                onClick={() => onAgeGroupChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
