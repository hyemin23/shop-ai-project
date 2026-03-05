"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { type StudioType } from "@/types/studio";

const FILENAME_PREFIX: Record<StudioType, string> = {
  "try-on": "tryon",
  "color-swap": "color-swap",
  "pose-transfer": "pose-transfer",
  "background-swap": "background-swap",
  "multi-pose": "multi-pose",
};

export function useStudioDownload(type: StudioType) {
  return useCallback(
    async (imageUrl: string | undefined) => {
      if (!imageUrl) return;
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${FILENAME_PREFIX[type]}-${Date.now()}.webp`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        toast.error("다운로드에 실패했습니다");
      }
    },
    [type],
  );
}
