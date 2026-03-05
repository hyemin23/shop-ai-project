"use client";

import { useState, useCallback, useRef } from "react";
import {
  type AutoFittingItemState,
  type AutoFittingSSEEvent,
} from "@/types/auto-fitting";
import { AUTO_FITTING_PRESETS } from "@/config/auto-fitting";

interface UseAutoFittingGenerateOptions {
  onComplete?: (results: AutoFittingItemState[]) => void;
  onError?: (error: string) => void;
  onTokenInsufficient?: () => void;
}

interface UseAutoFittingGenerateReturn {
  items: AutoFittingItemState[];
  isProcessing: boolean;
  batchId: string | null;
  progress: { completed: number; total: number; failed: number };
  generate: (formData: FormData) => Promise<void>;
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

        const reader = response.body?.getReader();
        if (!reader) throw new Error("스트림을 읽을 수 없습니다.");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const dataLine = line
              .split("\n")
              .find((l) => l.startsWith("data: "));
            if (!dataLine) continue;

            const event: AutoFittingSSEEvent = JSON.parse(dataLine.slice(6));

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

            if (event.type === "batch_complete" && event.batchId) {
              setBatchId(event.batchId);
            }
          }
        }

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

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    await Promise.all(
      successItems.map(async (item) => {
        const response = await fetch(item.resultImageUrl!);
        const blob = await response.blob();
        const ext =
          blob.type.split("/")[1] === "jpeg"
            ? "jpg"
            : blob.type.split("/")[1] || "png";
        zip.file(`fitting_${item.index + 1}_${item.poseName}.${ext}`, blob);
      }),
    );

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auto_fitting_${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
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
