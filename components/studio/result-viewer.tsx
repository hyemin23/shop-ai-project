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
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
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
          className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl cursor-pointer bg-muted/30"
          onClick={() => setPreviewOpen(true)}
        >
          <Image
            src={imageUrl}
            alt="생성 결과 이미지"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-5 w-5 text-white" />
            </div>
          </div>
        </button>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={onDownload} className="flex-1">
            <Download className="mr-1.5 h-4 w-4" />
            다운로드
          </Button>
          <Button variant="outline" size="sm" onClick={onRegenerate} className="flex-1">
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
              variant="ghost"
              size="icon-sm"
              className="absolute -top-10 right-0 z-10 rounded-full text-white hover:bg-white/20 hover:text-white"
              onClick={() => setPreviewOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">닫기</span>
            </Button>
            <div className="relative aspect-auto max-h-[85vh] overflow-hidden rounded-2xl">
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
