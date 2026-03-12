"use client";

import { useCallback } from "react";
import { type UgcItemState, type UgcSSEEvent } from "@/types/ugc";
import { useBatchGenerate } from "@/hooks/use-batch-generate";

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
  const batch = useBatchGenerate<UgcItemState, UgcSSEEvent>(
    {
      apiEndpoint: "/api/studio/ugc",
      zipPrefix: "ugc",
      fileNameFn: (item) => `ugc_${item.index + 1}_${item.sceneName}`,
      errorMessage: "UGC 이미지 생성 요청 실패",
    },
    { onComplete, onError, onTokenInsufficient },
  );

  const generate = useCallback(
    async (formData: FormData, scenes: { id: string; name: string }[]) => {
      const initialItems: UgcItemState[] = scenes.map((scene, index) => ({
        index,
        sceneId: scene.id,
        sceneName: scene.name,
        status: "pending" as const,
      }));

      await batch.generate(formData, initialItems);
    },
    [batch],
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
