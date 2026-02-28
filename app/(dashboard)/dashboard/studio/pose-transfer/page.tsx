"use client";

import { useState, useCallback } from "react";
import { PersonStanding } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StudioLayout } from "@/components/studio/studio-layout";
import { ImageUploadZone } from "@/components/studio/image-upload-zone";
import { ResultViewer } from "@/components/studio/result-viewer";
import { ModeSelector } from "@/components/studio/mode-selector";
import { PosePresetGallery } from "@/components/studio/pose-preset-gallery";
import { TokenInsufficientDialog } from "@/components/studio/token-insufficient-dialog";
import { useStudioGenerate } from "@/hooks/use-studio-generate";
import { type GenerationMode } from "@/types/studio";

export default function StudioPoseTransferPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [poseType, setPoseType] = useState<"preset" | "custom">("preset");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [poseReferenceFile, setPoseReferenceFile] = useState<File | null>(null);
  const [mode, setMode] = useState<GenerationMode>("standard");
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const { status, result, generate, reset } = useStudioGenerate({
    type: "pose-transfer",
    mode,
    onTokenInsufficient: () => setTokenDialogOpen(true),
    onSuccess: () => toast.success("포즈가 변경되었습니다"),
  });

  const handleGenerate = useCallback(async () => {
    if (!sourceFile) return;
    if (poseType === "preset" && !selectedPresetId) return;
    if (poseType === "custom" && !poseReferenceFile) return;

    const formData = new FormData();
    formData.set("sourceImage", sourceFile);
    formData.set("poseType", poseType);
    if (poseType === "preset") {
      formData.set("presetId", selectedPresetId);
    } else {
      formData.set("poseReferenceImage", poseReferenceFile!);
    }
    formData.set("mode", mode);
    await generate(formData);
  }, [sourceFile, poseType, selectedPresetId, poseReferenceFile, mode, generate]);

  const handleDownload = useCallback(async () => {
    const imageUrl = result?.resultImageUrl;
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pose-transfer-${Date.now()}.webp`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("다운로드에 실패했습니다");
    }
  }, [result]);

  const handleRegenerate = useCallback(() => {
    reset();
    handleGenerate();
  }, [reset, handleGenerate]);

  const handlePresetSelect = useCallback((id: string) => {
    setPoseType("preset");
    setSelectedPresetId(id);
  }, []);

  const handleCustomUpload = useCallback((file: File) => {
    setPoseType("custom");
    setPoseReferenceFile(file);
  }, []);

  const isDisabled =
    !sourceFile ||
    (poseType === "preset" && !selectedPresetId) ||
    (poseType === "custom" && !poseReferenceFile) ||
    status === "processing";

  return (
    <>
      <StudioLayout
        title="포즈 변경"
        description="모델의 포즈를 변경합니다. 프리셋 중에서 선택하거나 참조 이미지를 업로드하세요."
        inputSection={
          <div className="space-y-4">
            <ImageUploadZone
              label="원본 이미지"
              description="포즈를 변경할 모델 사진"
              onFileSelect={setSourceFile}
            />
            <PosePresetGallery
              selectedPresetId={selectedPresetId}
              onPresetSelect={handlePresetSelect}
              onCustomUpload={handleCustomUpload}
            />
            <ModeSelector mode={mode} onModeChange={setMode} />
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isDisabled}
            >
              <PersonStanding className="mr-1.5 h-4 w-4" />
              포즈 변경
            </Button>
          </div>
        }
        resultSection={
          <ResultViewer
            imageUrl={result?.resultImageUrl}
            isProcessing={status === "processing"}
            onDownload={handleDownload}
            onRegenerate={handleRegenerate}
          />
        }
      />
      <TokenInsufficientDialog
        open={tokenDialogOpen}
        onOpenChange={setTokenDialogOpen}
      />
    </>
  );
}
