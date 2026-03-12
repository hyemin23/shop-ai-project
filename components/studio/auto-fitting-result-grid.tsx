"use client";

import { type AutoFittingItemState } from "@/types/auto-fitting";
import {
  BatchResultGrid,
  type BatchResultGridConfig,
} from "@/components/studio/batch-result-grid";

interface AutoFittingResultGridProps {
  items: AutoFittingItemState[];
  onDownloadAll: () => void;
  onRetryItem?: (index: number) => void;
  retryingIndex?: number | null;
  isProcessing: boolean;
}

const config: BatchResultGridConfig<AutoFittingItemState> = {
  gridClassName: "grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5",
  aspectClassName: "aspect-square",
  dialogMaxWidth: "max-w-3xl",
  completionText: (s, t) => `${s}/${t}개 피팅 생성 완료`,
  getLabel: (item) => item.poseName,
  getFileName: (item) => `fitting_${item.index + 1}.webp`,
  emptyMessage: "베이스 이미지를 업로드하고 생성 버튼을 눌러주세요.",
  showRetry: true,
};

export function AutoFittingResultGrid({
  items,
  onDownloadAll,
  onRetryItem,
  retryingIndex,
  isProcessing,
}: AutoFittingResultGridProps) {
  return (
    <BatchResultGrid
      items={items}
      onDownloadAll={onDownloadAll}
      isProcessing={isProcessing}
      config={config}
      onRetryItem={onRetryItem}
      retryingIndex={retryingIndex}
    />
  );
}
