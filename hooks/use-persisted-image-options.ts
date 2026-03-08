"use client";

import { useState, useCallback } from "react";
import { type ImageGenerationOptions } from "@/types/studio";
import { DEFAULT_IMAGE_OPTIONS } from "@/config/studio";

const STORAGE_KEY = "ddokpick:image-options";

function loadSaved(): ImageGenerationOptions {
  if (typeof window === "undefined") return DEFAULT_IMAGE_OPTIONS;
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
 */
export function usePersistedImageOptions() {
  const [options, setOptionsState] =
    useState<ImageGenerationOptions>(loadSaved);

  const setOptions = useCallback((next: ImageGenerationOptions) => {
    setOptionsState(next);
    // aspectRatio, imageSize만 저장 (userPrompt 제외)
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
