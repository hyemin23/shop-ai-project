"use client";

import { type UgcItemState } from "@/types/ugc";
import {
  BatchResultGrid,
  type BatchResultGridConfig,
} from "@/components/studio/batch-result-grid";

interface UgcResultGridProps {
  items: UgcItemState[];
  onDownloadAll: () => void;
  isProcessing: boolean;
}

const config: BatchResultGridConfig<UgcItemState> = {
  gridClassName: "grid-cols-2 gap-2 sm:grid-cols-3",
  aspectClassName: "aspect-[9/16]",
  dialogMaxWidth: "max-w-lg",
  completionText: (s, t) => `${s}/${t}개 UGC 이미지 생성 완료`,
  getLabel: (item) => item.sceneName,
  getFileName: (item) => `ugc_${item.index + 1}.webp`,
  emptyMessage: "의류 이미지를 업로드하고 장소를 선택한 뒤 생성 버튼을 눌러주세요.",
};

export function UgcResultGrid({
  items,
  onDownloadAll,
  isProcessing,
}: UgcResultGridProps) {
  return (
    <BatchResultGrid
      items={items}
      onDownloadAll={onDownloadAll}
      isProcessing={isProcessing}
      config={config}
    />
  );
}
