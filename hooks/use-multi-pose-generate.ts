"use client";

import { useState, useCallback, useRef } from "react";
import { type GenerationMode } from "@/types/studio";
import {
  type MultiPoseItemState,
  type MultiPoseSSEEvent,
} from "@/types/multi-pose";
import { consumeSSEStream } from "@/lib/sse";
import { downloadAsZip } from "@/lib/download";

interface UseMultiPoseGenerateOptions {
  mode?: GenerationMode;
  onComplete?: (results: MultiPoseItemState[]) => void;
  onError?: (error: string) => void;
  onTokenInsufficient?: () => void;
}

interface UseMultiPoseGenerateReturn {
  items: MultiPoseItemState[];
  isProcessing: boolean;
  batchId: string | null;
  progress: { completed: number; total: number; failed: number };
  generate: (formData: FormData) => Promise<void>;
  reset: () => void;
  downloadZip: () => Promise<void>;
}

export function useMultiPoseGenerate({
  mode = "standard",
  onComplete,
  onError,
  onTokenInsufficient,
}: UseMultiPoseGenerateOptions): UseMultiPoseGenerateReturn {
  const [items, setItems] = useState<MultiPoseItemState[]>([]);
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
    async (formData: FormData) => {
      if (isProcessing) return;

      abortRef.current = new AbortController();
      setIsProcessing(true);
      setBatchId(null);

      formData.set("mode", mode);

      // 프롬프트에서 초기 상태 생성
      const initialItems: MultiPoseItemState[] = [];
      for (let i = 0; i < 5; i++) {
        const prompt = (formData.get(`prompt_${i}`) as string)?.trim();
        if (prompt) {
          initialItems.push({
            index: i,
            prompt,
            status: "pending",
          });
        }
      }
      setItems(initialItems);

      try {
        if (!navigator.onLine) {
          throw new Error(
            "네트워크 연결을 확인해주세요.",
          );
        }

        const response = await fetch("/api/studio/multi-pose", {
          method: "POST",
          body: formData,
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 402 && errorData.code === "TOKEN_INSUFFICIENT") {
            setIsProcessing(false);
            setItems([]);
            onTokenInsufficient?.();
            return;
          }
          throw new Error(errorData.error || "멀티포즈 처리 요청 실패");
        }

        await consumeSSEStream<MultiPoseSSEEvent>(response, (event) => {
          if (event.type === "batch_complete") {
            if (event.batchId) setBatchId(event.batchId);
            return;
          }

          setItems((prev) => {
            const updated = [...prev];
            const itemIdx = updated.findIndex(
              (item) => item.index === event.index,
            );
            if (itemIdx !== -1) {
              updated[itemIdx] = {
                ...updated[itemIdx],
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
    [mode, isProcessing, onComplete, onError, onTokenInsufficient],
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
        fileName: `pose_${item.index + 1}_result`,
      })),
      `multi_pose_${new Date().toISOString().slice(0, 10)}.zip`,
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
