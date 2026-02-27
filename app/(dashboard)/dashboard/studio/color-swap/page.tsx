"use client";

import { Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudioLayout } from "@/components/studio/studio-layout";
import { ImageUploadZone } from "@/components/studio/image-upload-zone";
import { ResultViewer } from "@/components/studio/result-viewer";
import { ModeSelector } from "@/components/studio/mode-selector";
import { ColorPicker } from "@/components/studio/color-picker";

export default function StudioColorSwapPage() {
  return (
    <StudioLayout
      title="색상 변경"
      description="의류 색상을 원하는 색으로 변경합니다. 프리셋 팔레트 또는 HEX 코드를 입력하세요."
      inputSection={
        <div className="space-y-4">
          <ImageUploadZone
            label="원본 이미지"
            description="색상을 변경할 의류 사진"
          />
          <ColorPicker />
          <div>
            <div className="text-sm font-medium mb-2">의류 영역</div>
            <Select defaultValue="auto">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">자동 감지</SelectItem>
                <SelectItem value="top">상의</SelectItem>
                <SelectItem value="bottom">하의</SelectItem>
                <SelectItem value="dress">원피스</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ModeSelector />
          <Button className="w-full" onClick={() => {}}>
            <Palette className="mr-1.5 h-4 w-4" />
            색상 변경
          </Button>
        </div>
      }
      resultSection={<ResultViewer />}
    />
  );
}
