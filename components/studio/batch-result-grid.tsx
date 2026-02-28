"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type BatchItemState } from "@/types/batch";

interface BatchResultGridProps {
  items: BatchItemState[];
  onDownloadAll: () => void;
  isProcessing: boolean;
}

export function BatchResultGrid({
  items,
  onDownloadAll,
  isProcessing,
}: BatchResultGridProps) {
  const successItems = items.filter(
    (i) => i.status === "success" && i.resultImageUrl,
  );

  if (successItems.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        {isProcessing ? "결과가 생성되면 여기에 표시됩니다." : "결과 이미지가 없습니다."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {successItems.length}장 생성 완료
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownloadAll}
          disabled={isProcessing}
        >
          <Download className="mr-1.5 h-4 w-4" />
          ZIP 다운로드
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {successItems.map((item) => (
          <div
            key={item.index}
            className="group relative aspect-square overflow-hidden rounded-md border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.resultImageUrl!}
              alt={`결과 ${item.index + 1}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/60 px-1.5 py-1">
              <span className="truncate text-[10px] text-white">
                {item.fileName}
              </span>
              <a
                href={item.resultImageUrl!}
                download={`result_${item.fileName}`}
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="h-3.5 w-3.5 text-white hover:text-primary" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
