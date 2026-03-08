"use client";

import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StudioLayout } from "@/components/studio/studio-layout";
import { ImageUploadZone } from "@/components/studio/image-upload-zone";
import { ResultViewer } from "@/components/studio/result-viewer";
import { ImageOptionsSelector } from "@/components/studio/image-options-selector";
import { PromptInput } from "@/components/studio/prompt-input";
import { TokenInsufficientDialog } from "@/components/studio/token-insufficient-dialog";
import { useStudioGenerate } from "@/hooks/use-studio-generate";
import { useStudioDownload } from "@/hooks/use-studio-download";
import { usePersistedImageOptions } from "@/hooks/use-persisted-image-options";
import { appendImageOptions, resolveMode } from "@/config/studio";

export default function StudioBackgroundSwapPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [imageOptions, setImageOptions] = usePersistedImageOptions();
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const { status, result, generate, reset } = useStudioGenerate({
    type: "background-swap",
    mode: resolveMode(imageOptions.imageSize),
    onTokenInsufficient: () => setTokenDialogOpen(true),
    onSuccess: () => toast.success("이미지가 생성되었습니다"),
    onError: (msg) => toast.error(msg),
  });

  const handleGenerate = useCallback(async () => {
    if (!sourceFile || !referenceFile) return;
    const formData = new FormData();
    formData.set("sourceImage", sourceFile);
    formData.set("referenceImage", referenceFile);
    appendImageOptions(formData, imageOptions);
    await generate(formData);
  }, [sourceFile, referenceFile, imageOptions, generate]);

  const download = useStudioDownload("background-swap");

  const handleRegenerate = useCallback(() => {
    reset();
    handleGenerate();
  }, [reset, handleGenerate]);

  const isDisabled = !sourceFile || !referenceFile || status === "processing";

  return (
    <>
      <StudioLayout
        title="배경 변경"
        description="모델 사진의 배경을 교체합니다. 모델 사진과 교체할 배경 이미지를 업로드하세요."
        inputSection={
          <div className="space-y-4">
            <ImageUploadZone
              label="모델 사진"
              description="배경을 변경할 모델 사진"
              onFileSelect={setSourceFile}
            />
            <ImageUploadZone
              label="배경 이미지"
              description="교체할 배경 사진"
              onFileSelect={setReferenceFile}
            />
            <PromptInput
              mode="background-swap"
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
