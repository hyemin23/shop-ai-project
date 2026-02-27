"use client";

import { PersonStanding } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StudioLayout } from "@/components/studio/studio-layout";
import { ImageUploadZone } from "@/components/studio/image-upload-zone";
import { ResultViewer } from "@/components/studio/result-viewer";
import { ModeSelector } from "@/components/studio/mode-selector";
import { PosePresetGallery } from "@/components/studio/pose-preset-gallery";

export default function StudioPoseTransferPage() {
  return (
    <StudioLayout
      title="포즈 변경"
      description="모델의 포즈를 변경합니다. 프리셋 중에서 선택하거나 참조 이미지를 업로드하세요."
      inputSection={
        <div className="space-y-4">
          <ImageUploadZone
            label="원본 이미지"
            description="포즈를 변경할 모델 사진"
          />
          <PosePresetGallery />
          <ModeSelector />
          <Button className="w-full" onClick={() => {}}>
            <PersonStanding className="mr-1.5 h-4 w-4" />
            포즈 변경
          </Button>
        </div>
      }
      resultSection={<ResultViewer />}
    />
  );
}
