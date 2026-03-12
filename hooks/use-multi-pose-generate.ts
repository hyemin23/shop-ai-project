"use client";

import { useCallback } from "react";
import { type GenerationMode } from "@/types/studio";
import {
  type MultiPoseItemState,
  type MultiPoseSSEEvent,
} from "@/types/multi-pose";
import { useBatchGenerate } from "@/hooks/use-batch-generate";

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
  const batch = useBatchGenerate<MultiPoseItemState, MultiPoseSSEEvent>(
    {
      apiEndpoint: "/api/studio/multi-pose",
      zipPrefix: "multi_pose",
      fileNameFn: (item) => `pose_${item.index + 1}_result`,
      errorMessage: "멀티포즈 처리 요청 실패",
      // multi-pose는 index가 비연속적일 수 있으므로 findIndex 기반 매핑
      mapSSEEvent: (prev, event) => {
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
      },
    },
    { onComplete, onError, onTokenInsufficient },
  );

  const generate = useCallback(
    async (formData: FormData) => {
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

      await batch.generate(formData, initialItems);
    },
    [mode, batch],
  );

  return {
    items: batch.items,
    isProcessing: batch.isProcessing,
    batchId: batch.batchId,
    progress: batch.progress,
    generate,
    reset: batch.reset,
    downloadZip: batch.downloadZip,
  };
}
