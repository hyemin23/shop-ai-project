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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudioLayout } from "@/components/studio/studio-layout";
import { ImageUploadZone } from "@/components/studio/image-upload-zone";
import { ResultViewer } from "@/components/studio/result-viewer";
import { ImageOptionsSelector } from "@/components/studio/image-options-selector";
import { ColorPicker } from "@/components/studio/color-picker";
import { PromptInput } from "@/components/studio/prompt-input";
import { TokenInsufficientDialog } from "@/components/studio/token-insufficient-dialog";
import { useStudioGenerate } from "@/hooks/use-studio-generate";
import { useStudioDownload } from "@/hooks/use-studio-download";
import { DEFAULT_IMAGE_OPTIONS, appendImageOptions } from "@/config/studio";

type ColorMode = "hex" | "reference";

export default function StudioColorSwapPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [colorMode, setColorMode] = useState<ColorMode>("hex");
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [garmentRegion, setGarmentRegion] = useState("auto");
  const [imageOptions, setImageOptions] = useState(DEFAULT_IMAGE_OPTIONS);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const { status, result, generate, reset } = useStudioGenerate({
    type: "color-swap",
    mode: "standard",
    onTokenInsufficient: () => setTokenDialogOpen(true),
    onSuccess: () => toast.success("색상이 변경되었습니다"),
  });

  const handleGenerate = useCallback(async () => {
    if (!sourceFile) return;
    const formData = new FormData();
    formData.set("sourceImage", sourceFile);
    formData.set("garmentRegion", garmentRegion);
    formData.set("mode", "standard");
    appendImageOptions(formData, imageOptions);

    if (colorMode === "hex") {
      if (!selectedColor) return;
      formData.set("targetColor", selectedColor);
    } else {
      if (!referenceFile) return;
      formData.set("referenceImage", referenceFile);
    }

    await generate(formData);
  }, [
    sourceFile,
    colorMode,
    selectedColor,
    referenceFile,
    garmentRegion,
    imageOptions,
    generate,
  ]);

  const download = useStudioDownload("color-swap");

  const handleRegenerate = useCallback(() => {
    reset();
    handleGenerate();
  }, [reset, handleGenerate]);

  const isDisabled =
    !sourceFile ||
    (colorMode === "hex" ? !selectedColor : !referenceFile) ||
    status === "processing";

  return (
    <>
      <StudioLayout
        title="색상 변경"
        description="의류 색상을 원하는 색으로 변경합니다. 색상을 직접 선택하거나 참조 이미지에서 색상을 추출할 수 있습니다."
        inputSection={
          <div className="space-y-4">
            <ImageUploadZone
              label="원본 이미지"
              description="색상을 변경할 의류 사진"
              onFileSelect={setSourceFile}
            />
            <Tabs
              value={colorMode}
              onValueChange={(v) => setColorMode(v as ColorMode)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="hex" className="flex-1">
                  색상 선택
                </TabsTrigger>
                <TabsTrigger value="reference" className="flex-1">
                  참조 이미지
                </TabsTrigger>
              </TabsList>
              <TabsContent value="hex" className="mt-3">
                <ColorPicker
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                />
              </TabsContent>
              <TabsContent value="reference" className="mt-3">
                <ImageUploadZone
                  label="참조 이미지"
                  description="추출할 색상이 담긴 의류/원단 사진"
                  onFileSelect={setReferenceFile}
                />
              </TabsContent>
            </Tabs>
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
            <PromptInput
              mode="color-swap"
              value={imageOptions.userPrompt ?? ""}
              onChange={(v) =>
                setImageOptions({ ...imageOptions, userPrompt: v })
              }
              disabled={status === "processing"}
            />
            <ImageOptionsSelector
              options={imageOptions}
              onOptionsChange={setImageOptions}
            />
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
            onDownload={() => download(result?.resultImageUrl)}
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
