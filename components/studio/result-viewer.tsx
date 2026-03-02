"use client";


import { useState } from "react";
import Image from "next/image";
import { Download, ImageIcon, RefreshCw, X, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProcessingIndicator } from "@/components/studio/processing-indicator";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ResultViewerProps {
  imageUrl?: string;
  isProcessing?: boolean;
  onDownload?: () => void;
  onRegenerate?: () => void;
}

export function ResultViewer({
  imageUrl,
  isProcessing,
  onDownload,
  onRegenerate,
}: ResultViewerProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (isProcessing) {
    return <ProcessingIndicator />;
  }

  if (!imageUrl) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
        <ImageIcon className="h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          결과가 여기에 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <>
      <div>
        <button
          type="button"
          className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg cursor-pointer"
          onClick={() => setPreviewOpen(true)}
        >
          <Image
            src={imageUrl}
            alt="생성 결과 이미지"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
            <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </button>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="mr-1.5 h-4 w-4" />
            다운로드
          </Button>
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            재생성
          </Button>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none [&>button]:hidden">
          <VisuallyHidden>
            <DialogTitle>결과 이미지 미리보기</DialogTitle>
          </VisuallyHidden>
          <div className="relative">
            <Button
              variant="secondary"
              size="icon"
              className="absolute -top-10 right-0 z-10 h-8 w-8 rounded-full"
              onClick={() => setPreviewOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">닫기</span>
            </Button>
            <div className="relative aspect-auto max-h-[85vh] overflow-hidden rounded-lg">
              <Image
                src={imageUrl}
                alt="생성 결과 이미지 확대"
                width={1200}
                height={900}
                className="h-auto max-h-[85vh] w-full object-contain"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
