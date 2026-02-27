"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StudioLayout } from "@/components/studio/studio-layout";
import { ImageUploadZone } from "@/components/studio/image-upload-zone";
import { ResultViewer } from "@/components/studio/result-viewer";
import { ModeSelector } from "@/components/studio/mode-selector";

export default function StudioTryOnPage() {
  return (
    <StudioLayout
      title="의류 교체"
      description="Base 이미지에 Reference 의류를 합성합니다. 모델 사진과 교체할 의류 사진을 업로드하세요."
      inputSection={
        <div className="space-y-4">
          <ImageUploadZone
            label="모델 사진"
            description="모델이 착용 중인 전신 사진"
          />
          <ImageUploadZone
            label="교체할 의류"
            description="합성할 의류 단독 사진"
          />
          <ModeSelector />
          <Button className="w-full" onClick={() => {}}>
            <Sparkles className="mr-1.5 h-4 w-4" />
            생성하기
          </Button>
        </div>
      }
      resultSection={<ResultViewer />}
    />
  );
}
