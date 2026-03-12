"use client";

import { useState, type ReactNode } from "react";
import {
  Download,
  Loader2,
  AlertCircle,
  SkipForward,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { downloadImage } from "@/lib/download";

/** 각 아이템이 반드시 가져야 하는 공통 필드 */
export interface BatchResultItem {
  index: number;
  status: "pending" | "processing" | "success" | "error" | "skipped";
  resultImageUrl?: string;
  error?: string;
}

export interface BatchResultGridConfig<T extends BatchResultItem> {
  /** 그리드 열 클래스 (예: "grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5") */
  gridClassName: string;
  /** 카드 aspect ratio 클래스 (예: "aspect-square", "aspect-[9/16]") */
  aspectClassName: string;
  /** Dialog max-width 클래스 (예: "max-w-3xl", "max-w-lg") */
  dialogMaxWidth?: string;
  /** 상단 완료 텍스트 (successCount, totalCount) => string */
  completionText: (successCount: number, totalCount: number) => string;
  /** Badge에 표시할 라벨 */
  getLabel: (item: T) => string;
  /** 개별 다운로드 파일명 */
  getFileName: (item: T) => string;
  /** 아이템이 없을 때 빈 상태 메시지 */
  emptyMessage: string | ((isProcessing: boolean) => string);
  /** success만 렌더링할지 (multi-pose처럼), 기본값 false */
  successOnly?: boolean;
  /** retry 버튼 표시 여부 (auto-fitting) */
  showRetry?: boolean;
  /** 커스텀 성공 아이템 오버레이 (multi-pose 하단 바 등) */
  renderOverlay?: (item: T) => ReactNode;
}

export interface BatchResultGridProps<T extends BatchResultItem> {
  items: T[];
  onDownloadAll: () => void;
  isProcessing: boolean;
  config: BatchResultGridConfig<T>;
  /** retry 콜백 (auto-fitting) */
  onRetryItem?: (index: number) => void;
  /** 현재 retry 중인 인덱스 (auto-fitting) */
  retryingIndex?: number | null;
}

export function BatchResultGrid<T extends BatchResultItem>({
  items,
  onDownloadAll,
  isProcessing,
  config,
  onRetryItem,
  retryingIndex,
}: BatchResultGridProps<T>) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const successItems = items.filter(
    (i) => i.status === "success" && i.resultImageUrl,
  );

  // 빈 상태 처리
  const isEmpty = config.successOnly
    ? successItems.length === 0
    : items.length === 0;

  if (isEmpty) {
    const msg =
      typeof config.emptyMessage === "function"
        ? config.emptyMessage(isProcessing)
        : config.emptyMessage;
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        {msg}
      </div>
    );
  }

  const renderItems = config.successOnly ? successItems : items;

  return (
    <div className="space-y-3">
      {/* 상단 정보 바 */}
      {successItems.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {config.completionText(successItems.length, items.length)}
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

      {/* 그리드 */}
      <div className={`grid ${config.gridClassName}`}>
        {renderItems.map((item) => (
          <div
            key={item.index}
            className={`group relative ${config.aspectClassName} overflow-hidden rounded-md border${
              config.successOnly ? " cursor-pointer" : ""
            }`}
            onClick={
              config.successOnly
                ? () => setPreviewUrl(item.resultImageUrl!)
                : undefined
            }
          >
            {item.status === "success" && item.resultImageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.resultImageUrl}
                  alt={`${config.getLabel(item)} 결과`}
                  className={`h-full w-full object-cover transition-transform group-hover:scale-105${
                    !config.successOnly ? " cursor-pointer" : ""
                  }`}
                  onClick={
                    !config.successOnly
                      ? () => setPreviewUrl(item.resultImageUrl!)
                      : undefined
                  }
                />
                <div className="absolute top-1.5 left-1.5">
                  <Badge variant="secondary" className="text-[10px]">
                    {config.getLabel(item)}
                  </Badge>
                </div>
                {/* 커스텀 오버레이 또는 기본 hover 다운로드 버튼 */}
                {config.renderOverlay ? (
                  config.renderOverlay(item)
                ) : (
                  <div className="absolute right-1 bottom-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(
                          item.resultImageUrl!,
                          config.getFileName(item),
                        );
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </>
            ) : item.status === "processing" ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/50 p-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">
                  {config.getLabel(item)}
                </span>
              </div>
            ) : item.status === "error" ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-destructive/5 p-2 text-center">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-[10px] text-destructive">
                  {item.error || "오류 발생"}
                </span>
                {config.showRetry && onRetryItem && (
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
                  {config.getLabel(item)}
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
        <DialogContent className={`${config.dialogMaxWidth ?? "max-w-3xl"} p-2`}>
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
