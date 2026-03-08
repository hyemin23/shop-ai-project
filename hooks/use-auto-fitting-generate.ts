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

        const reader = response.body?.getReader();
        if (!reader) throw new Error("스트림을 읽을 수 없습니다.");

        const decoder = new TextDecoder();
        let buffer = "";

        function processSSELines(text: string) {
          const lines = text.split("\n\n").filter(Boolean);
          for (const line of lines) {
            const dataLine = line
              .split("\n")
              .find((l) => l.startsWith("data: "));
            if (!dataLine) continue;

            const event: AutoFittingSSEEvent = JSON.parse(dataLine.slice(6));

            if (event.type === "batch_complete") {
              if (event.batchId) setBatchId(event.batchId);
              continue;
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
          }
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // 스트림 종료 시 버퍼에 남은 이벤트 처리
            if (buffer.trim()) processSSELines(buffer);
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          if (lines.length > 0) {
            processSSELines(lines.join("\n\n"));
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
    retryingIndex,
    batchId,
    progress,
    generate,
    retryItem,
    reset,
    downloadZip,
  };
}
