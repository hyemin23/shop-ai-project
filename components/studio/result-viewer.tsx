// 생성 결과 이미지 뷰어 컴포넌트
"use client";

import Image from "next/image";
import { Download, ImageIcon, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProcessingIndicator } from "@/components/studio/processing-indicator";

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
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt="생성 결과 이미지"
          fill
          className="object-cover"
        />
      </div>
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
  );
}
