"use client";

import { useState, useCallback, useRef } from "react";
import { type GenerationMode } from "@/types/studio";
import {
  type MultiPoseItemState,
  type MultiPoseSSEEvent,
} from "@/types/multi-pose";

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

        const reader = response.body?.getReader();
        if (!reader) throw new Error("스트림을 읽을 수 없습니다.");

        const decoder = new TextDecoder();
        let buffer = "";

        function processSSELines(text: string) {
          const chunks = text.split("\n\n").filter(Boolean);
          for (const chunk of chunks) {
            const dataLine = chunk
              .split("\n")
              .find((l) => l.startsWith("data: "));
            if (!dataLine) continue;

            const event: MultiPoseSSEEvent = JSON.parse(dataLine.slice(6));

            if (event.type === "batch_complete") {
              if (event.batchId) setBatchId(event.batchId);
              continue;
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
          }
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
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
        zip.file(`pose_${item.index + 1}_result.${ext}`, blob);
      }),
    );

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `multi_pose_${new Date().toISOString().slice(0, 10)}.zip`;
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
