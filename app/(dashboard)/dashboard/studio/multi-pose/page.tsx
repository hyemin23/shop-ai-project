"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Users } from "lucide-react";
import { ImageUploadZone } from "@/components/studio/image-upload-zone";
import { ImageOptionsSelector } from "@/components/studio/image-options-selector";
import { MultiPosePromptList } from "@/components/studio/multi-pose-prompt-list";
import { MultiPoseProgressPanel } from "@/components/studio/multi-pose-progress-panel";
import { MultiPoseResultGrid } from "@/components/studio/multi-pose-result-grid";
import { TokenInsufficientDialog } from "@/components/studio/token-insufficient-dialog";
import { useMultiPoseGenerate } from "@/hooks/use-multi-pose-generate";
import { usePersistedImageOptions } from "@/hooks/use-persisted-image-options";
import { resolveMode } from "@/config/studio";
import { MAX_POSE_VARIATIONS } from "@/types/multi-pose";
import { toast } from "sonner";

export default function MultiPosePage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [prompts, setPrompts] = useState<string[]>(
    Array(MAX_POSE_VARIATIONS).fill(""),
  );
  const [imageOptions, setImageOptions] = usePersistedImageOptions();
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const {
    items,
    isProcessing,
    progress,
    generate,
    reset,
    downloadZip,
  } = useMultiPoseGenerate({
    mode: resolveMode(imageOptions.imageSize),
    onComplete: () => {
      toast.success("멀티포즈 처리가 완료되었습니다.");
    },
    onError: (error) => {
      toast.error(error);
    },
    onTokenInsufficient: () => {
      setTokenDialogOpen(true);
    },
  });

  const filledCount = prompts.filter((p) => p.trim()).length;

  const handleGenerate = useCallback(async () => {
    if (!sourceFile || filledCount === 0) return;

    const formData = new FormData();
    formData.set("sourceImage", sourceFile);

    prompts.forEach((prompt, index) => {
      if (prompt.trim()) {
        formData.set(`prompt_${index}`, prompt.trim());
      }
    });

    if (imageOptions.imageSize) {
      formData.set("imageSize", imageOptions.imageSize);
    }

    await generate(formData);
  }, [sourceFile, prompts, filledCount, imageOptions, generate]);

  const handleReset = useCallback(() => {
    setSourceFile(null);
    setPrompts(Array(MAX_POSE_VARIATIONS).fill(""));
    reset();
  }, [reset]);

  return (
    <div className="space-y-6">
      {/* 모바일 배너 */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 lg:hidden">
        <Monitor className="h-4 w-4 shrink-0" />
        <p>멀티포즈 변경은 데스크톱에서 더 편리하게 사용할 수 있습니다.</p>
      </div>

      {/* 헤더 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">멀티포즈 변경</h1>
        <p className="text-muted-foreground">
          하나의 이미지로 최대 5가지 포즈 변형을 동시에 생성합니다.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 입력 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 소스 이미지 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">소스 이미지</label>
              <ImageUploadZone
                label="소스 이미지"
                description="포즈를 변경할 원본 이미지"
                onFileSelect={setSourceFile}
              />
            </div>

            {/* 포즈 프롬프트 리스트 */}
            <MultiPosePromptList
              prompts={prompts}
              onChange={setPrompts}
              disabled={isProcessing}
            />

            {/* 이미지 옵션 */}
            <ImageOptionsSelector
              options={imageOptions}
              onOptionsChange={setImageOptions}
              creditCount={filledCount}
              creditLabel="포즈"
            />

            {/* 버튼 */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleGenerate}
                disabled={!sourceFile || filledCount === 0 || isProcessing}
              >
                {isProcessing
                  ? `처리 중 (${progress.completed}/${progress.total})`
                  : `${filledCount}개 포즈 변형 생성`}
              </Button>
              {items.length > 0 && (
                <Button variant="outline" onClick={handleReset}>
                  초기화
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 결과 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>결과</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultiPoseProgressPanel
              items={items}
              isProcessing={isProcessing}
            />
            <MultiPoseResultGrid
              items={items}
              onDownloadAll={downloadZip}
              isProcessing={isProcessing}
            />
          </CardContent>
        </Card>
      </div>

      {/* 토큰 부족 다이얼로그 */}
      <TokenInsufficientDialog
        open={tokenDialogOpen}
        onOpenChange={setTokenDialogOpen}
      />
    </div>
  );
}
