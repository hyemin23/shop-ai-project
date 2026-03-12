"use client";

import { Download } from "lucide-react";
import { type MultiPoseItemState } from "@/types/multi-pose";
import { downloadImage } from "@/lib/download";
import {
  BatchResultGrid,
  type BatchResultGridConfig,
} from "@/components/studio/batch-result-grid";

interface MultiPoseResultGridProps {
  items: MultiPoseItemState[];
  onDownloadAll: () => void;
  isProcessing: boolean;
}

const config: BatchResultGridConfig<MultiPoseItemState> = {
  gridClassName: "grid-cols-2 gap-2 sm:grid-cols-3",
  aspectClassName: "aspect-square",
  dialogMaxWidth: "max-w-3xl",
  completionText: (s) => `${s}개 포즈 생성 완료`,
  getLabel: (item) => `#${item.index + 1}`,
  getFileName: (item) => `pose_${item.index + 1}_result.webp`,
  emptyMessage: (isProcessing) =>
    isProcessing
      ? "결과가 생성되면 여기에 표시됩니다."
      : "결과 이미지가 없습니다.",
  successOnly: true,
  renderOverlay: (item) => (
    <div className="absolute right-0 bottom-0 left-0 flex items-center justify-between bg-black/60 px-1.5 py-1">
      <span className="truncate text-[10px] text-white">{item.prompt}</span>
      <button
        className="shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          downloadImage(
            item.resultImageUrl!,
            `pose_${item.index + 1}_result.webp`,
          );
        }}
      >
        <Download className="h-3.5 w-3.5 text-white hover:text-primary" />
      </button>
    </div>
  ),
};

export function MultiPoseResultGrid({
  items,
  onDownloadAll,
  isProcessing,
}: MultiPoseResultGridProps) {
  return (
    <BatchResultGrid
      items={items}
      onDownloadAll={onDownloadAll}
      isProcessing={isProcessing}
      config={config}
    />
  );
}
