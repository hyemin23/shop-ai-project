"use client";

import { Loader2, Clock } from "lucide-react";
import type { VideoGenerationStatus } from "@/types/video";

interface VideoGenerationStatusProps {
  status: VideoGenerationStatus;
  elapsedSeconds: number;
}

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function VideoGenerationStatusDisplay({
  status,
  elapsedSeconds,
}: VideoGenerationStatusProps) {
  if (status === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          비디오 생성을 요청하고 있습니다...
        </p>
      </div>
    );
  }

  if (status === "polling") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">비디오를 생성하고 있습니다</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>경과 시간: {formatTime(elapsedSeconds)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          생성에는 보통 1~3분이 소요됩니다
        </p>
      </div>
    );
  }

  return null;
}
