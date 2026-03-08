"use client";

import type { ImageToVideoRequest } from "@/types/video";
import { useVideoGenerate } from "@/hooks/use-video-generate";

interface UseImageToVideoGenerateOptions {
  onSuccess?: (videoUrl: string) => void;
  onError?: (error: string) => void;
  onTokenInsufficient?: () => void;
}

/**
 * @deprecated useVideoGenerate<ImageToVideoRequest>를 직접 사용하세요.
 */
export function useImageToVideoGenerate(
  options: UseImageToVideoGenerateOptions = {},
) {
  return useVideoGenerate<ImageToVideoRequest>({
    apiPath: "/api/video/image-to-video",
    ...options,
  });
}
