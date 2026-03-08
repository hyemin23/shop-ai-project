"use client";

import { useState, useCallback } from "react";
import { Sparkles, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StudioLayout } from "@/components/studio/studio-layout";
import { ImageUploadZone } from "@/components/studio/image-upload-zone";
import { ResultViewer } from "@/components/studio/result-viewer";
import { ImageOptionsSelector } from "@/components/studio/image-options-selector";
import { PromptInput } from "@/components/studio/prompt-input";
import { InstructionChips } from "@/components/studio/instruction-chips";
import { TokenInsufficientDialog } from "@/components/studio/token-insufficient-dialog";
import { useStudioGenerate } from "@/hooks/use-studio-generate";
import { useStudioDownload } from "@/hooks/use-studio-download";
import { usePersistedImageOptions } from "@/hooks/use-persisted-image-options";
import { useGarmentClassify } from "@/hooks/use-garment-classify";
import {
  appendImageOptions,
  resolveMode,
  INSTRUCTION_CHIPS,
  CHIP_CONFLICTS,
} from "@/config/studio";

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  top: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  bottom: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  outerwear: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "one-piece": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const CATEGORY_SWAP_HINT: Record<string, string> = {
  top: "상의만 교체되고, 하의/신발/배경은 유지됩니다.",
  bottom: "하의만 교체되고, 상의/신발/배경은 유지됩니다.",
  outerwear: "아우터만 교체되고, 이너/하의/신발은 유지됩니다.",
  "one-piece": "상하의 전체가 교체되고, 신발/배경은 유지됩니다.",
};

export default function StudioTryOnPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [imageOptions, setImageOptions] = usePersistedImageOptions();
  const [selectedChipIds, setSelectedChipIds] = useState<string[]>([]);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const {
    result: classifyResult,
    isClassifying,
    classify,
    reset: resetClassify,
  } = useGarmentClassify();

  const { status, result, generate, reset } = useStudioGenerate({
    type: "try-on",
    mode: resolveMode(imageOptions.imageSize),
    onTokenInsufficient: () => setTokenDialogOpen(true),
    onSuccess: () => toast.success("이미지가 생성되었습니다"),
  });

  const handleReferenceSelect = useCallback(
    (file: File | null) => {
      setReferenceFile(file);
      resetClassify();
      if (file) {
        classify(file);
      }
    },
    [classify, resetClassify],
  );

  const handleChipToggle = useCallback((id: string) => {
    setSelectedChipIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((c) => c !== id);
      }
      const conflict = CHIP_CONFLICTS[id];
      const next = conflict ? prev.filter((c) => c !== conflict) : [...prev];
      return [...next, id];
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!sourceFile || !referenceFile) return;
    const formData = new FormData();
    formData.set("sourceImage", sourceFile);
    formData.set("referenceImage", referenceFile);
    if (classifyResult) {
      formData.set("garmentCategory", classifyResult.category);
    }
    const chipTexts = selectedChipIds
      .map((id) => INSTRUCTION_CHIPS.find((c) => c.id === id)?.promptText)
      .filter(Boolean)
      .join(" ");
    const combinedPrompt = [chipTexts, imageOptions.userPrompt]
      .filter(Boolean)
      .join("\n");
    const optionsWithChips = { ...imageOptions, userPrompt: combinedPrompt || undefined };
    appendImageOptions(formData, optionsWithChips);
    await generate(formData);
  }, [sourceFile, referenceFile, classifyResult, selectedChipIds, imageOptions, generate]);

  const download = useStudioDownload("try-on");

  const handleRegenerate = useCallback(() => {
    reset();
    handleGenerate();
  }, [reset, handleGenerate]);

  const isDisabled = !sourceFile || !referenceFile || status === "processing" || isClassifying;

  return (
    <>
      <StudioLayout
        title="의류 교체"
        description="모델 사진의 의류를 교체할 의류로 합성합니다. 모델 사진과 교체할 의류 사진을 업로드하세요."
        inputSection={
          <div className="space-y-4">
            <ImageUploadZone
              label="모델 사진"
              description="모델이 착용 중인 전신 사진"
              onFileSelect={setSourceFile}
            />
            <ImageUploadZone
              label="교체할 의류"
              description="상품 사진, 착용 사진, 상세페이지 등 의류가 보이는 사진"
              onFileSelect={handleReferenceSelect}
            />
            {/* 의류 분류 결과 배지 */}
            {(isClassifying || classifyResult) && (
              <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
                {isClassifying ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    의류 유형 감지 중...
                  </div>
                ) : classifyResult ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        감지된 의류 유형
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_BADGE_COLORS[classifyResult.category] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {classifyResult.label}
                      </span>
                    </div>
                    {classifyResult.description && (
                      <p className="text-xs text-muted-foreground">
                        {classifyResult.description}
                      </p>
                    )}
                    <p className="text-xs font-medium text-foreground/80">
                      {CATEGORY_SWAP_HINT[classifyResult.category] ?? ""}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
            <PromptInput
              mode="try-on"
              value={imageOptions.userPrompt ?? ""}
              onChange={(v) =>
                setImageOptions({ ...imageOptions, userPrompt: v })
              }
              disabled={status === "processing"}
            />
            <InstructionChips
              selectedIds={selectedChipIds}
              onToggle={handleChipToggle}
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
              <Sparkles className="mr-1.5 h-4 w-4" />
              생성하기
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
