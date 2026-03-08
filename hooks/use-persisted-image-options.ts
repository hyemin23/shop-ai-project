"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { type ImageGenerationOptions } from "@/types/studio";
import { DEFAULT_IMAGE_OPTIONS } from "@/config/studio";

const STORAGE_KEY = "ddokpick:image-options";

function getSnapshot(): ImageGenerationOptions {
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

function getServerSnapshot(): ImageGenerationOptions {
  return DEFAULT_IMAGE_OPTIONS;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/**
 * 마지막으로 선택한 비율/해상도를 localStorage에 자동 저장하고,
 * 다음 페이지 로드 시 복원하는 훅.
 * userPrompt는 페이지마다 다르므로 저장하지 않음.
 */
export function usePersistedImageOptions() {
  const persisted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [options, setOptionsState] = useState(persisted);

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
