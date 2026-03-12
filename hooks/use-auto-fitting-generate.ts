"use client";

import { useState, useCallback, useRef } from "react";
import {
  type AutoFittingItemState,
  type AutoFittingSSEEvent,
} from "@/types/auto-fitting";
import { AUTO_FITTING_PRESETS } from "@/config/auto-fitting";
import { invalidateTokenBalance } from "@/hooks/use-token-balance";
import { useBatchGenerate } from "@/hooks/use-batch-generate";

interface UseAutoFittingGenerateOptions {
  onComplete?: (results: AutoFittingItemState[]) => void;
  onError?: (error: string) => void;
  onTokenInsufficient?: () => void;
}

interface UseAutoFittingGenerateReturn {
  items: AutoFittingItemState[];
  isProcessing: boolean;
  retryingIndex: number | null;
  batchId: string | null;
  progress: { completed: number; total: number; failed: number };
  generate: (formData: FormData) => Promise<void>;
  retryItem: (index: number) => Promise<void>;
  reset: () => void;
  downloadZip: () => Promise<void>;
}

export function useAutoFittingGenerate({
  onComplete,
  onError,
  onTokenInsufficient,
}: UseAutoFittingGenerateOptions): UseAutoFittingGenerateReturn {
  const [retryingIndex, setRetryingIndex] = useState<number | null>(null);
  const lastFormDataRef = useRef<FormData | null>(null);

  const batch = useBatchGenerate<AutoFittingItemState, AutoFittingSSEEvent>(
    {
      apiEndpoint: "/api/studio/auto-fitting",
      zipPrefix: "auto_fitting",
      fileNameFn: (item) => `fitting_${item.index + 1}_${item.poseName}`,
      errorMessage: "자동피팅 처리 요청 실패",
    },
    { onComplete, onError, onTokenInsufficient },
  );

  const generate = useCallback(
    async (formData: FormData) => {
      lastFormDataRef.current = formData;

      const initialItems: AutoFittingItemState[] = AUTO_FITTING_PRESETS.map(
        (preset, index) => ({
          index,
          poseName: preset.name,
          poseDescription: preset.description,
          status: "pending" as const,
        }),
      );

      await batch.generate(formData, initialItems);
    },
    [batch],
  );

  const retryItem = useCallback(
    async (index: number) => {
      const item = batch.items[index];
      if (!item || !lastFormDataRef.current) return;
      const preset = AUTO_FITTING_PRESETS[index];
      if (!preset) return;

      setRetryingIndex(index);
      batch.setItems((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: "processing", error: undefined };
        return updated;
      });

      try {
        const original = lastFormDataRef.current;
        const formData = new FormData();
        formData.set("sourceImage", original.get("sourceImage") as File);
        formData.set("presetId", preset.id);
        if (original.get("imageSize"))
          formData.set("imageSize", original.get("imageSize") as string);
        if (original.get("stylePrompt"))
          formData.set("stylePrompt", original.get("stylePrompt") as string);

        const response = await fetch("/api/studio/auto-fitting/retry", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 402 && errorData.code === "TOKEN_INSUFFICIENT") {
            onTokenInsufficient?.();
            batch.setItems((prev) => {
              const updated = [...prev];
              updated[index] = { ...updated[index], status: "error", error: "토큰 부족" };
              return updated;
            });
            return;
          }
          throw new Error(errorData.error || "재생성 실패");
        }

        const data = await response.json();
        invalidateTokenBalance();
        batch.setItems((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: "success",
            resultImageUrl: data.resultImageUrl,
            processingTime: data.processingTime,
            error: undefined,
          };
          return updated;
        });
      } catch (error) {
        batch.setItems((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: "error",
            error: (error as Error).message,
          };
          return updated;
        });
        onError?.((error as Error).message);
      } finally {
        setRetryingIndex(null);
      }
    },
    [batch, onError, onTokenInsufficient],
  );

  return {
    items: batch.items,
    isProcessing: batch.isProcessing,
    retryingIndex,
    batchId: batch.batchId,
    progress: batch.progress,
    generate,
    retryItem,
    reset: batch.reset,
    downloadZip: batch.downloadZip,
  };
}
