"use client";

import { useState, useCallback } from "react";
import { Palette } from "lucide-react";
import { toast } from "sonner";

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
import { TokenInsufficientDialog } from "@/components/studio/token-insufficient-dialog";
import { useStudioGenerate } from "@/hooks/use-studio-generate";
import { type GenerationMode } from "@/types/studio";

export default function StudioColorSwapPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [garmentRegion, setGarmentRegion] = useState("auto");
  const [mode, setMode] = useState<GenerationMode>("standard");
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const { status, result, generate, reset } = useStudioGenerate({
    type: "color-swap",
    mode,
    onTokenInsufficient: () => setTokenDialogOpen(true),
    onSuccess: () => toast.success("색상이 변경되었습니다"),
  });

  const handleGenerate = useCallback(async () => {
    if (!sourceFile || !selectedColor) return;
    const formData = new FormData();
    formData.set("sourceImage", sourceFile);
    formData.set("targetColor", selectedColor);
    formData.set("garmentRegion", garmentRegion);
    formData.set("mode", mode);
    await generate(formData);
  }, [sourceFile, selectedColor, garmentRegion, mode, generate]);

  const handleDownload = useCallback(async () => {
    const imageUrl = result?.resultImageUrl;
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `color-swap-${Date.now()}.webp`;
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

  const isDisabled =
    !sourceFile || !selectedColor || status === "processing";

  return (
    <>
      <StudioLayout
        title="색상 변경"
        description="의류 색상을 원하는 색으로 변경합니다. 프리셋 팔레트 또는 HEX 코드를 입력하세요."
        inputSection={
          <div className="space-y-4">
            <ImageUploadZone
              label="원본 이미지"
              description="색상을 변경할 의류 사진"
              onFileSelect={setSourceFile}
            />
            <ColorPicker
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />
            <div>
              <div className="text-sm font-medium mb-2">의류 영역</div>
              <Select value={garmentRegion} onValueChange={setGarmentRegion}>
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
            <ModeSelector mode={mode} onModeChange={setMode} />
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isDisabled}
            >
              <Palette className="mr-1.5 h-4 w-4" />
              색상 변경
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
