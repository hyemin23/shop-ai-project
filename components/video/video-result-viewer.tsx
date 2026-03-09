"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadVideo } from "@/lib/download";
import { toast } from "sonner";

interface VideoResultViewerProps {
  videoUrl: string;
}

export function VideoResultViewer({ videoUrl }: VideoResultViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await downloadVideo(videoUrl, `video_${Date.now()}.mp4`);
    } catch {
      toast.error("다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full overflow-hidden rounded-lg border bg-black">
        <video
          src={videoUrl}
          controls
          autoPlay
          loop
          className="mx-auto max-h-[480px] w-full object-contain"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {isDownloading ? "다운로드 중..." : "다운로드"}
      </Button>
    </div>
  );
}
