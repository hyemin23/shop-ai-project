"use client";

import { useCallback, useSyncExternalStore } from "react";
import { type ImageGenerationOptions } from "@/types/studio";
import { DEFAULT_IMAGE_OPTIONS } from "@/config/studio";

const STORAGE_KEY = "ddokpick:image-options";

// 스냅샷 캐시 — useSyncExternalStore가 Object.is로 비교하므로
// raw 문자열이 바뀌지 않으면 동일 참조를 반환해야 무한 루프 방지
let cachedRaw: string | null = null;
let cachedSnapshot: ImageGenerationOptions = DEFAULT_IMAGE_OPTIONS;

function parseOptions(raw: string | null): ImageGenerationOptions {
  if (!raw) return DEFAULT_IMAGE_OPTIONS;
  try {
    const parsed = JSON.parse(raw) as Partial<ImageGenerationOptions>;
    return {
      aspectRatio: parsed.aspectRatio ?? DEFAULT_IMAGE_OPTIONS.aspectRatio,
      imageSize: parsed.imageSize ?? DEFAULT_IMAGE_OPTIONS.imageSize,
    };
  } catch {
    return DEFAULT_IMAGE_OPTIONS;
  }
}

function getSnapshot(): ImageGenerationOptions {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = parseOptions(raw);
  }
  return cachedSnapshot;
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
 * useSyncExternalStore + 스냅샷 캐시로 hydration 안정성 보장.
 */
export function usePersistedImageOptions() {
  const options = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setOptions = useCallback((next: ImageGenerationOptions) => {
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
    // 동일 탭 내 리렌더 트리거 (storage 이벤트는 다른 탭에서만 발생)
    window.dispatchEvent(new Event("storage"));
  }, []);

  return [options, setOptions] as const;
}
