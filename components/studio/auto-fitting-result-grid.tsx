"use client";

import { useState } from "react";
import { Download, Loader2, AlertCircle, SkipForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { type AutoFittingItemState } from "@/types/auto-fitting";
import { downloadImage } from "@/lib/download";

interface AutoFittingResultGridProps {
  items: AutoFittingItemState[];
  onDownloadAll: () => void;
  onRetryItem?: (index: number) => void;
  retryingIndex?: number | null;
  isProcessing: boolean;
}

export function AutoFittingResultGrid({
  items,
  onDownloadAll,
  onRetryItem,
  retryingIndex,
  isProcessing,
}: AutoFittingResultGridProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        베이스 이미지를 업로드하고 생성 버튼을 눌러주세요.
      </div>
    );
  }

  const successItems = items.filter(
    (i) => i.status === "success" && i.resultImageUrl,
  );

  return (
    <div className="space-y-3">
      {successItems.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {successItems.length}/{items.length}개 피팅 생성 완료
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
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.index}
            className="group relative aspect-square overflow-hidden rounded-md border"
          >
            {item.status === "success" && item.resultImageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.resultImageUrl}
                  alt={`${item.poseName} 결과`}
                  className="h-full w-full cursor-pointer object-cover transition-transform group-hover:scale-105"
                  onClick={() => setPreviewUrl(item.resultImageUrl!)}
                />
                <div className="absolute top-1.5 left-1.5">
                  <Badge variant="secondary" className="text-[10px]">
                    {item.poseName}
                  </Badge>
                </div>
                <div className="absolute right-1 bottom-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(item.resultImageUrl!, `fitting_${item.index + 1}.webp`);
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            ) : item.status === "processing" ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/50 p-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">
                  {item.poseName}
                </span>
              </div>
            ) : item.status === "error" ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-destructive/5 p-2 text-center">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-[10px] text-destructive">
                  {item.error || "오류 발생"}
                </span>
                {onRetryItem && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 gap-1 px-2 text-[10px]"
                    onClick={() => onRetryItem(item.index)}
                    disabled={retryingIndex !== null || isProcessing}
                  >
                    <RotateCcw className="h-3 w-3" />
                    재생성
                  </Button>
                )}
              </div>
            ) : item.status === "skipped" ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/30 p-2 text-center">
                <SkipForward className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  건너뜀
                </span>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/30 p-2 text-center">
                <span className="text-xs text-muted-foreground">
                  {item.poseName}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  대기 중
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 확대 미리보기 Dialog */}
      <Dialog
        open={!!previewUrl}
        onOpenChange={(open) => !open && setPreviewUrl(null)}
      >
        <DialogContent className="max-w-3xl p-2">
          <VisuallyHidden>
            <DialogTitle>확대 미리보기</DialogTitle>
          </VisuallyHidden>
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
