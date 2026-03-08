"use client";

import { useState, useCallback } from "react";
import { ScanSearch } from "lucide-react";
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
import { ImageOptionsSelector } from "@/components/studio/image-options-selector";
import { PromptInput } from "@/components/studio/prompt-input";
import { TokenInsufficientDialog } from "@/components/studio/token-insufficient-dialog";
import { DetailPresetSelector } from "@/components/studio/detail-preset-selector";
import { useStudioGenerate } from "@/hooks/use-studio-generate";
import { useStudioDownload } from "@/hooks/use-studio-download";
import { usePersistedImageOptions } from "@/hooks/use-persisted-image-options";
import { appendImageOptions, resolveMode } from "@/config/studio";
import {
  type DetailExtractMode,
  DETAIL_PRESETS,
  DEFAULT_4SPLIT_PRESETS,
} from "@/types/detail-extract";

export default function StudioDetailExtractPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [extractionMode, setExtractionMode] = useState<DetailExtractMode>("rose-cut");
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>([
    ...DEFAULT_4SPLIT_PRESETS,
  ]);
  const [imageOptions, setImageOptions] = usePersistedImageOptions();
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const { status, result, generate, reset } = useStudioGenerate({
    type: "detail-extract",
    mode: resolveMode(imageOptions.imageSize),
    onTokenInsufficient: () => setTokenDialogOpen(true),
    onSuccess: () =>
      toast.success(
        extractionMode === "rose-cut"
          ? "장미컷이 생성되었습니다"
          : extractionMode === "nukki"
            ? "누끼컷이 생성되었습니다"
            : "4분할컷이 생성되었습니다",
      ),
  });

  const handleGenerate = useCallback(async () => {
    if (!sourceFile) return;
    if (extractionMode === "4-split" && selectedPresetIds.length !== 4) {
      toast.error("4분할컷은 4개의 디테일을 선택해야 합니다");
      return;
    }

    const formData = new FormData();
    formData.set("sourceImage", sourceFile);
    formData.set("extractionMode", extractionMode);
    appendImageOptions(formData, imageOptions);

    if (extractionMode === "4-split") {
      selectedPresetIds.forEach((id, i) => {
        const preset = DETAIL_PRESETS.find((p) => p.id === id);
        if (preset) formData.set(`preset_${i}`, preset.description);
      });
    }

    await generate(formData);
  }, [sourceFile, extractionMode, selectedPresetIds, imageOptions, generate]);

  const download = useStudioDownload("detail-extract");

  const handleRegenerate = useCallback(() => {
    reset();
    handleGenerate();
  }, [reset, handleGenerate]);

  const isDisabled =
    !sourceFile ||
    (extractionMode === "4-split" && selectedPresetIds.length !== 4) ||
    status === "processing";


  return (
    <>
      <StudioLayout
        title="상세 추출"
        description="의류의 디테일을 극대화한 클로즈업 이미지를 생성합니다. 장미컷(원단 소용돌이) 또는 4분할컷(주요 디테일 4곳)을 선택하세요."
        inputSection={
          <div className="space-y-4">
            <ImageUploadZone
              label="원본 이미지"
              description="디테일을 추출할 의류 사진"
              onFileSelect={setSourceFile}
            />
            <div>
              <div className="text-sm font-medium mb-2">추출 모드</div>
              <Select
                value={extractionMode}
                onValueChange={(v) => setExtractionMode(v as DetailExtractMode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rose-cut">
                    장미컷 (원단 소용돌이 클로즈업)
                  </SelectItem>
                  <SelectItem value="4-split">
                    4분할컷 (디테일 2x2 그리드)
                  </SelectItem>
                  <SelectItem value="nukki">
                    누끼컷 (흰 배경 상품 단독 컷)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {extractionMode === "4-split" && (
              <DetailPresetSelector
                selectedIds={selectedPresetIds}
                onSelectionChange={setSelectedPresetIds}
                disabled={status === "processing"}
              />
            )}
            <PromptInput
              mode="detail-extract"
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
              <ScanSearch className="mr-1.5 h-4 w-4" />
              {extractionMode === "rose-cut"
                ? "장미컷 생성"
                : extractionMode === "nukki"
                  ? "누끼컷 생성"
                  : "4분할컷 생성"}
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
