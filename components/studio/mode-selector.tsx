// 생성 모드(기본/고품질) 선택 컴포넌트
"use client";

import { Sparkles, Zap } from "lucide-react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type GenerationMode } from "@/types/studio";

interface ModeSelectorProps {
  mode?: GenerationMode;
  onModeChange?: (mode: GenerationMode) => void;
}

export function ModeSelector({ onModeChange }: ModeSelectorProps) {
  return (
    <RadioGroup
      defaultValue="standard"
      className="flex gap-4"
      onValueChange={(value) => {
        onModeChange?.(value as GenerationMode);
      }}
    >
      {/* 기본 모드 */}
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
        {/* TODO: 선택 시 border-primary 스타일 적용 */}
        <RadioGroupItem value="standard" className="mt-0.5" />
        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium">기본 모드</p>
          <p className="text-xs text-muted-foreground">
            Flash 모델 · 빠르고 경제적
          </p>
          <p className="text-xs text-muted-foreground">10 토큰~</p>
        </div>
      </label>

      {/* 고품질 모드 */}
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
        {/* TODO: 선택 시 border-primary 스타일 적용 */}
        <RadioGroupItem value="premium" className="mt-0.5" />
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium">고품질 모드</p>
          <p className="text-xs text-muted-foreground">Pro 모델 · 높은 품질</p>
          <p className="text-xs text-muted-foreground">20 토큰~</p>
        </div>
      </label>
    </RadioGroup>
  );
}
