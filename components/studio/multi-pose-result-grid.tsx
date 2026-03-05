"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { type MultiPoseItemState } from "@/types/multi-pose";
import { downloadImage } from "@/lib/download";

interface MultiPoseResultGridProps {
  items: MultiPoseItemState[];
  onDownloadAll: () => void;
  isProcessing: boolean;
}

export function MultiPoseResultGrid({
  items,
  onDownloadAll,
  isProcessing,
}: MultiPoseResultGridProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const successItems = items.filter(
    (i) => i.status === "success" && i.resultImageUrl,
  );

  if (successItems.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        {isProcessing
          ? "결과가 생성되면 여기에 표시됩니다."
          : "결과 이미지가 없습니다."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {successItems.length}개 포즈 생성 완료
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
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border"
            onClick={() => setPreviewUrl(item.resultImageUrl!)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.resultImageUrl!}
              alt={`포즈 ${item.index + 1} 결과`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute top-1.5 left-1.5">
              <Badge variant="secondary" className="text-[10px]">
                #{item.index + 1}
              </Badge>
            </div>
            <div className="absolute right-0 bottom-0 left-0 flex items-center justify-between bg-black/60 px-1.5 py-1">
              <span className="truncate text-[10px] text-white">
                {item.prompt}
              </span>
              <button
                className="shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(item.resultImageUrl!, `pose_${item.index + 1}_result.webp`);
                }}
              >
                <Download className="h-3.5 w-3.5 text-white hover:text-primary" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 확대 미리보기 Dialog */}
      <Dialog
        open={!!previewUrl}
        onOpenChange={(open) => !open && setPreviewUrl(null)}
      >
        <DialogContent className="max-w-3xl p-2">
          {previewUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={previewUrl}
              alt="확대 미리보기"
              className="h-auto w-full rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
