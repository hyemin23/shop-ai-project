"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoResultViewerProps {
  videoUrl: string;
}

export function VideoResultViewer({ videoUrl }: VideoResultViewerProps) {
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
      <Button variant="outline" size="sm" asChild>
        <a href={videoUrl} download target="_blank" rel="noopener noreferrer">
          <Download className="mr-2 h-4 w-4" />
          다운로드
        </a>
      </Button>
    </div>
  );
}
