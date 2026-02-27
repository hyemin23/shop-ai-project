"use client";

import { PersonStanding } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { POSE_PRESETS } from "@/config/studio";
import { ImageUploadZone } from "@/components/studio/image-upload-zone";
import { cn } from "@/lib/utils";

interface PosePresetGalleryProps {
  selectedPresetId?: string;
  onPresetSelect?: (id: string) => void;
  onCustomUpload?: (file: File) => void;
}

export function PosePresetGallery({
  selectedPresetId,
  onPresetSelect,
}: PosePresetGalleryProps) {
  return (
    <Tabs defaultValue="preset">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="preset">프리셋</TabsTrigger>
        <TabsTrigger value="custom">커스텀 포즈</TabsTrigger>
      </TabsList>
      <TabsContent value="preset">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {POSE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-2 transition-all hover:border-primary",
                selectedPresetId === preset.id &&
                  "ring-2 ring-primary border-primary",
              )}
              onClick={() => onPresetSelect?.(preset.id)}
            >
              <div className="flex h-24 w-full items-center justify-center rounded bg-muted">
                <PersonStanding className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-center text-xs font-medium">{preset.name}</p>
            </button>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="custom">
        <ImageUploadZone
          label="참조 포즈 이미지"
          description="원하는 포즈의 참조 이미지를 업로드하세요"
        />
      </TabsContent>
    </Tabs>
  );
}
