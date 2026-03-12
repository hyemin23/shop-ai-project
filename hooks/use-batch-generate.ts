"use client";

import { useState, useCallback, useRef } from "react";
import { type BatchItemStatus } from "@/types/batch";
import { consumeSSEStream } from "@/lib/sse";
import { downloadAsZip } from "@/lib/download";
import { invalidateTokenBalance } from "@/hooks/use-token-balance";

// ---------------------------------------------------------------------------
// Base types – 모든 배치 아이템이 공유하는 최소 필드
// ---------------------------------------------------------------------------

export interface BaseBatchItem {
  index: number;
  status: BatchItemStatus;
  resultImageUrl?: string;
  error?: string;
  processingTime?: number;
}

export interface BaseBatchSSEEvent {
  type: "item_start" | "item_complete" | "item_error" | "batch_complete";
  index: number;
  total: number;
  status: BatchItemStatus;
  resultImageUrl?: string;
  error?: string;
  processingTime?: number;
  batchId?: string;
}

// ---------------------------------------------------------------------------
// Config – 훅별로 주입하는 설정
// ---------------------------------------------------------------------------

export interface BatchGenerateConfig<TItem extends BaseBatchItem, TEvent extends BaseBatchSSEEvent> {
  /** API endpoint (e.g. "/api/studio/auto-fitting") */
  apiEndpoint: string;
  /** Zip 파일명 prefix (e.g. "auto_fitting") */
  zipPrefix: string;
  /** 개별 파일명 생성 함수 */
  fileNameFn: (item: TItem) => string;
  /** SSE 이벤트를 아이템 상태로 매핑하는 함수 (기본: index 기반 직접 매핑) */
  mapSSEEvent?: (
    prev: TItem[],
    event: TEvent,
  ) => TItem[];
  /** fetch 에러 메시지 (fallback) */
  errorMessage: string;
}

// ---------------------------------------------------------------------------
// Options & Return
// ---------------------------------------------------------------------------

export interface UseBatchGenerateOptions<TItem extends BaseBatchItem> {
  onComplete?: (results: TItem[]) => void;
  onError?: (error: string) => void;
  onTokenInsufficient?: () => void;
}

export interface UseBatchGenerateReturn<TItem extends BaseBatchItem> {
  items: TItem[];
  setItems: React.Dispatch<React.SetStateAction<TItem[]>>;
  isProcessing: boolean;
  batchId: string | null;
  progress: { completed: number; total: number; failed: number };
  generate: (formData: FormData, initialItems: TItem[]) => Promise<void>;
  reset: () => void;
  downloadZip: () => Promise<void>;
  abortRef: React.RefObject<AbortController | null>;
}

// ---------------------------------------------------------------------------
// 공통 훅
// ---------------------------------------------------------------------------

export function useBatchGenerate<
  TItem extends BaseBatchItem,
  TEvent extends BaseBatchSSEEvent = BaseBatchSSEEvent,
>(
  config: BatchGenerateConfig<TItem, TEvent>,
  options: UseBatchGenerateOptions<TItem>,
): UseBatchGenerateReturn<TItem> {
  const { onComplete, onError, onTokenInsufficient } = options;
  const [items, setItems] = useState<TItem[]>([]);
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

  // SSE 이벤트 → 아이템 상태 매핑 (기본 구현: index로 직접 매핑)
  const defaultMapSSEEvent = useCallback(
    (prev: TItem[], event: TEvent): TItem[] => {
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
    },
    [],
  );

  const mapEvent = config.mapSSEEvent ?? defaultMapSSEEvent;

  const generate = useCallback(
    async (formData: FormData, initialItems: TItem[]) => {
      if (isProcessing) return;

      abortRef.current = new AbortController();
      setIsProcessing(true);
      setBatchId(null);
      setItems(initialItems);

      try {
        if (!navigator.onLine) {
          throw new Error("네트워크 연결을 확인해주세요.");
        }

        const response = await fetch(config.apiEndpoint, {
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
          throw new Error(errorData.error || config.errorMessage);
        }

        await consumeSSEStream<TEvent>(response, (event) => {
          if (event.type === "batch_complete") {
            if (event.batchId) setBatchId(event.batchId);
            return;
          }

          setItems((prev) => mapEvent(prev, event));
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
    [isProcessing, config.apiEndpoint, config.errorMessage, mapEvent, onComplete, onError, onTokenInsufficient],
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
        fileName: config.fileNameFn(item),
      })),
      `${config.zipPrefix}_${new Date().toISOString().slice(0, 10)}.zip`,
    );
  }, [items, config]);

  return {
    items,
    setItems,
    isProcessing,
    batchId,
    progress,
    generate,
    reset,
    downloadZip,
    abortRef,
  };
}
