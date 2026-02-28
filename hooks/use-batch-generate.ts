"use client";

import { useState, useCallback, useRef } from "react";
import { type StudioType, type GenerationMode } from "@/types/studio";
import { type BatchItemState, type BatchSSEEvent } from "@/types/batch";

interface UseBatchGenerateOptions {
  type: StudioType;
  mode?: GenerationMode;
  onComplete?: (results: BatchItemState[]) => void;
  onError?: (error: string) => void;
}

interface UseBatchGenerateReturn {
  items: BatchItemState[];
  isProcessing: boolean;
  batchId: string | null;
  progress: { completed: number; total: number; failed: number };
  generate: (formData: FormData) => Promise<void>;
  reset: () => void;
  downloadZip: () => Promise<void>;
}

export function useBatchGenerate({
  type,
  mode = "standard",
  onComplete,
  onError,
}: UseBatchGenerateOptions): UseBatchGenerateReturn {
  const [items, setItems] = useState<BatchItemState[]>([]);
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

      formData.set("type", type);
      formData.set("mode", mode);

      // 파일 이름으로 초기 상태 생성
      const fileNames: string[] = [];
      for (let i = 0; i < 10; i++) {
        const file = formData.get(`sourceImage_${i}`) as File | null;
        if (file) fileNames.push(file.name);
      }

      const initialItems: BatchItemState[] = fileNames.map((name, idx) => ({
        index: idx,
        fileName: name,
        status: "pending" as const,
      }));
      setItems(initialItems);

      try {
        const response = await fetch("/api/studio/batch", {
          method: "POST",
          body: formData,
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "배치 처리 요청 실패");
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

            const event: BatchSSEEvent = JSON.parse(dataLine.slice(6));

            setItems((prev) => {
              const updated = [...prev];
              if (event.index < updated.length) {
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
    [type, mode, isProcessing, onComplete, onError],
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
        const ext = blob.type.split("/")[1] === "jpeg" ? "jpg" : blob.type.split("/")[1] || "png";
        const baseName = item.fileName.replace(/\.[^.]+$/, "");
        zip.file(`${baseName}_result.${ext}`, blob);
      }),
    );

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch_results_${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  return { items, isProcessing, batchId, progress, generate, reset, downloadZip };
}
