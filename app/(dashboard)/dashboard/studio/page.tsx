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
import { DEFAULT_IMAGE_OPTIONS, appendImageOptions } from "@/config/studio";

export default function StudioTryOnPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [imageOptions, setImageOptions] = useState(DEFAULT_IMAGE_OPTIONS);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const { status, result, generate, reset } = useStudioGenerate({
    type: "try-on",
    mode: "standard",
    onTokenInsufficient: () => setTokenDialogOpen(true),
    onSuccess: () => toast.success("이미지가 생성되었습니다"),
  });

  const handleGenerate = useCallback(async () => {
    if (!sourceFile || !referenceFile) return;
    const formData = new FormData();
    formData.set("sourceImage", sourceFile);
    formData.set("referenceImage", referenceFile);
    formData.set("mode", "standard");
    appendImageOptions(formData, imageOptions);
    await generate(formData);
  }, [sourceFile, referenceFile, imageOptions, generate]);

  const download = useStudioDownload("try-on");

  const handleRegenerate = useCallback(() => {
    reset();
    handleGenerate();
  }, [reset, handleGenerate]);

  const isDisabled = !sourceFile || !referenceFile || status === "processing";

  return (
    <>
      <StudioLayout
        title="의류 교체"
        description="Base 이미지에 Reference 의류를 합성합니다. 모델 사진과 교체할 의류 사진을 업로드하세요."
        inputSection={
          <div className="space-y-4">
            <ImageUploadZone
              label="모델 사진"
              description="모델이 착용 중인 전신 사진"
              onFileSelect={setSourceFile}
            />
            <ImageUploadZone
              label="교체할 의류"
              description="합성할 의류 단독 사진"
              onFileSelect={setReferenceFile}
            />
            <PromptInput
              mode="try-on"
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
