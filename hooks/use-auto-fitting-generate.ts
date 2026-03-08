"use client";

import { useState, useCallback, useRef } from "react";
import {
  type AutoFittingItemState,
  type AutoFittingSSEEvent,
} from "@/types/auto-fitting";
import { AUTO_FITTING_PRESETS } from "@/config/auto-fitting";
import { consumeSSEStream } from "@/lib/sse";
import { downloadAsZip } from "@/lib/download";
import { invalidateTokenBalance } from "@/hooks/use-token-balance";

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
  const [items, setItems] = useState<AutoFittingItemState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryingIndex, setRetryingIndex] = useState<number | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const lastFormDataRef = useRef<FormData | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const progress = {
    completed: items.filter((i) => i.status === "success").length,
    total: items.length,
    failed: items.filter(
      (i) => i.status === "error" || i.status === "skipped",
    ).length,
  };

  const generate = useCallback(
    async (formData: FormData) => {
      if (isProcessing) return;

      abortRef.current = new AbortController();
      lastFormDataRef.current = formData;
      setIsProcessing(true);
      setBatchId(null);

      // 프리셋에서 초기 상태 생성
      const initialItems: AutoFittingItemState[] = AUTO_FITTING_PRESETS.map(
        (preset, index) => ({
          index,
          poseName: preset.name,
          poseDescription: preset.description,
          status: "pending" as const,
        }),
      );
      setItems(initialItems);

      try {
        if (!navigator.onLine) {
          throw new Error("네트워크 연결을 확인해주세요.");
        }

        const response = await fetch("/api/studio/auto-fitting", {
          method: "POST",
          body: formData,
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (
            response.status === 402 &&
            errorData.code === "TOKEN_INSUFFICIENT"
          ) {
            setIsProcessing(false);
            setItems([]);
            onTokenInsufficient?.();
            return;
          }
          throw new Error(errorData.error || "자동피팅 처리 요청 실패");
        }

        await consumeSSEStream<AutoFittingSSEEvent>(response, (event) => {
          if (event.type === "batch_complete") {
            if (event.batchId) setBatchId(event.batchId);
            return;
          }

          setItems((prev) => {
            const updated = [...prev];
            if (updated[event.index]) {
              updated[event.index] = {
                ...updated[event.index],
                status: event.status,
                resultImageUrl: event.resultImageUrl,
                error: event.error,
                processingTime: event.processingTime,
              };
            }
            return updated;
          });
        });

        setIsProcessing(false);
        invalidateTokenBalance();
        setItems((current) => {
          onComplete?.(current);
          return current;
        });
      } catch (error) {
        setIsProcessing(false);
        if ((error as Error).name !== "AbortError") {
          onError?.((error as Error).message);
        }
      }
    },
    [isProcessing, onComplete, onError, onTokenInsufficient],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setItems([]);
    setIsProcessing(false);
    setBatchId(null);
  }, []);

  const retryItem = useCallback(
    async (index: number) => {
      const item = items[index];
      if (!item || !lastFormDataRef.current) return;
      const preset = AUTO_FITTING_PRESETS[index];
      if (!preset) return;

      setRetryingIndex(index);
      setItems((prev) => {
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
            setItems((prev) => {
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
        setItems((prev) => {
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
        setItems((prev) => {
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
    [items, onError, onTokenInsufficient],
  );

  const downloadZip = useCallback(async () => {
    const successItems = items.filter(
      (i) => i.status === "success" && i.resultImageUrl,
    );
    if (successItems.length === 0) return;

    await downloadAsZip(
      successItems.map((item) => ({
        url: item.resultImageUrl!,
        fileName: `fitting_${item.index + 1}_${item.poseName}`,
      })),
      `auto_fitting_${new Date().toISOString().slice(0, 10)}.zip`,
    );
  }, [items]);

  return {
    items,
    isProcessing,
    retryingIndex,
    batchId,
    progress,
    generate,
    retryItem,
    reset,
    downloadZip,
  };
}
