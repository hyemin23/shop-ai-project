"use client";

import { useState, useCallback } from "react";
import { type ImageGenerationOptions } from "@/types/studio";
import { DEFAULT_IMAGE_OPTIONS } from "@/config/studio";

const STORAGE_KEY = "ddokpick:image-options";

function loadSaved(): ImageGenerationOptions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_IMAGE_OPTIONS;
    const parsed = JSON.parse(raw) as Partial<ImageGenerationOptions>;
    return {
      aspectRatio: parsed.aspectRatio ?? DEFAULT_IMAGE_OPTIONS.aspectRatio,
      imageSize: parsed.imageSize ?? DEFAULT_IMAGE_OPTIONS.imageSize,
    };
  } catch {
    return DEFAULT_IMAGE_OPTIONS;
  }
}

/**
 * 마지막으로 선택한 비율/해상도를 localStorage에 자동 저장하고,
 * 다음 페이지 로드 시 복원하는 훅.
 * userPrompt는 페이지마다 다르므로 저장하지 않음.
 *
 * lazy initializer: 클라이언트에서는 localStorage에서 복원,
 * SSR에서는 DEFAULT_IMAGE_OPTIONS 반환.
 */
export function usePersistedImageOptions() {
  const [options, setOptionsState] = useState<ImageGenerationOptions>(() => {
    if (typeof window === "undefined") return DEFAULT_IMAGE_OPTIONS;
    return loadSaved();
  });

  const setOptions = useCallback((next: ImageGenerationOptions) => {
    setOptionsState(next);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          aspectRatio: next.aspectRatio,
          imageSize: next.imageSize,
        }),
      );
    } catch {
      // localStorage 접근 불가 시 무시
    }
  }, []);

  return [options, setOptions] as const;
}
