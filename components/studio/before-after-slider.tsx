// 이미지 비교 (Before/After) 슬라이더 컴포넌트
"use client";

import Image from "next/image";
import { GripVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
}: BeforeAfterSliderProps) {
  return (
    <div
      className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
      aria-label="이미지 비교 슬라이더"
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={50}
      tabIndex={0}
      onMouseDown={() => {}}
      onTouchStart={() => {}}
    >
      {/* Before 이미지 */}
      <div className="absolute inset-0">
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="object-cover"
        />
      </div>

      {/* After 이미지 (우측 50%) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: "inset(0 0 0 50%)" }}
      >
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          className="object-cover"
        />
      </div>

      {/* 드래그 핸들 */}
      <div className="absolute top-0 bottom-0 left-[50%] flex items-center">
        <div className="h-full w-0.5 bg-white" />
        <div className="absolute left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* 라벨 */}
      <Badge variant="secondary" className="absolute top-3 left-3">
        {beforeLabel}
      </Badge>
      <Badge variant="secondary" className="absolute top-3 right-3">
        {afterLabel}
      </Badge>
    </div>
  );
}
