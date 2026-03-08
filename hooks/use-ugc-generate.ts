"use client";

import { useState, useCallback, useRef } from "react";
import { type UgcItemState, type UgcSSEEvent } from "@/types/ugc";
import { consumeSSEStream } from "@/lib/sse";
import { downloadAsZip } from "@/lib/download";

interface UseUgcGenerateOptions {
  onComplete?: (results: UgcItemState[]) => void;
  onError?: (error: string) => void;
  onTokenInsufficient?: () => void;
}

interface UseUgcGenerateReturn {
  items: UgcItemState[];
  isProcessing: boolean;
  batchId: string | null;
  progress: { completed: number; total: number; failed: number };
  generate: (formData: FormData, scenes: { id: string; name: string }[]) => Promise<void>;
  reset: () => void;
  downloadZip: () => Promise<void>;
}

export function useUgcGenerate({
  onComplete,
  onError,
  onTokenInsufficient,
}: UseUgcGenerateOptions): UseUgcGenerateReturn {
  const [items, setItems] = useState<UgcItemState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const progress = {
    completed: items.filter((i) => i.status === "success").length,
    total: items.length,
    failed: items.filter(
      (i) => i.status === "error" || i.status === "skipped",
    ).length,
  };

  const generate = useCallback(
    async (formData: FormData, scenes: { id: string; name: string }[]) => {
      if (isProcessing) return;

      abortRef.current = new AbortController();
      setIsProcessing(true);
      setBatchId(null);

      const initialItems: UgcItemState[] = scenes.map((scene, index) => ({
        index,
        sceneId: scene.id,
        sceneName: scene.name,
        status: "pending" as const,
      }));
      setItems(initialItems);

      try {
        if (!navigator.onLine) {
          throw new Error("네트워크 연결을 확인해주세요.");
        }

        const response = await fetch("/api/studio/ugc", {
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
          throw new Error(errorData.error || "UGC 이미지 생성 요청 실패");
        }

        await consumeSSEStream<UgcSSEEvent>(response, (event) => {
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

  const downloadZip = useCallback(async () => {
    const successItems = items.filter(
      (i) => i.status === "success" && i.resultImageUrl,
    );
    if (successItems.length === 0) return;

    await downloadAsZip(
      successItems.map((item) => ({
        url: item.resultImageUrl!,
        fileName: `ugc_${item.index + 1}_${item.sceneName}`,
      })),
      `ugc_${new Date().toISOString().slice(0, 10)}.zip`,
    );
  }, [items]);

  return {
    items,
    isProcessing,
    batchId,
    progress,
    generate,
    reset,
    downloadZip,
  };
}
