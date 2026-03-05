"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Monitor, Sparkles } from "lucide-react";
import { ImageUploadZone } from "@/components/studio/image-upload-zone";
import { ImageOptionsSelector } from "@/components/studio/image-options-selector";
import { AutoFittingResultGrid } from "@/components/studio/auto-fitting-result-grid";
import { TokenInsufficientDialog } from "@/components/studio/token-insufficient-dialog";
import { useAutoFittingGenerate } from "@/hooks/use-auto-fitting-generate";
import { type ImageGenerationOptions } from "@/types/studio";
import { AUTO_FITTING_POSE_COUNT } from "@/types/auto-fitting";
import { toast } from "sonner";

export default function AutoFittingPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [stylePrompt, setStylePrompt] = useState("");
  const [imageOptions, setImageOptions] = useState<ImageGenerationOptions>({
    imageSize: "1K",
  });
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const { items, isProcessing, progress, generate, reset, downloadZip } =
    useAutoFittingGenerate({
      onComplete: () => {
        toast.success("자동피팅 생성이 완료되었습니다.");
      },
      onError: (error) => {
        toast.error(error);
      },
      onTokenInsufficient: () => {
        setTokenDialogOpen(true);
      },
    });

  const handleGenerate = useCallback(async () => {
    if (!sourceFile) return;

    const formData = new FormData();
    formData.set("sourceImage", sourceFile);

    if (imageOptions.imageSize) {
      formData.set("imageSize", imageOptions.imageSize);
    }

    if (stylePrompt.trim()) {
      formData.set("stylePrompt", stylePrompt.trim());
    }

    await generate(formData);
  }, [sourceFile, imageOptions, stylePrompt, generate]);

  const handleReset = useCallback(() => {
    setSourceFile(null);
    setStylePrompt("");
    reset();
  }, [reset]);

  return (
    <div className="space-y-6">
      {/* 모바일 배너: 데스크톱 사용 권장 */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 lg:hidden">
        <Monitor className="h-4 w-4 shrink-0" />
        <p>자동피팅생성기는 데스크톱에서 더 편리하게 사용할 수 있습니다.</p>
      </div>

      {/* 페이지 헤더 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">자동피팅생성기</h1>
        <p className="text-muted-foreground">
          베이스 이미지 1장으로 {AUTO_FITTING_POSE_COUNT}가지 피팅 포즈를 자동 생성합니다.
        </p>
      </div>

      {/* 2컬럼 그리드 레이아웃 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 입력 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 베이스 이미지 업로드 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">베이스 이미지</label>
              <ImageUploadZone
                label="베이스 이미지"
                description="피팅 포즈를 생성할 원본 의류 이미지"
                onFileSelect={setSourceFile}
              />
            </div>

            {/* 이미지 생성 옵션 (해상도) */}
            <ImageOptionsSelector
              options={imageOptions}
              onOptionsChange={setImageOptions}
              creditCount={AUTO_FITTING_POSE_COUNT}
              creditLabel="포즈"
            />

            {/* 스타일 프롬프트 (선택 사항) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                스타일 프롬프트{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (선택)
                </span>
              </label>
              <Textarea
                placeholder="예: 스트릿 캐주얼 느낌으로, 밝은 조명..."
                value={stylePrompt}
                onChange={(e) => setStylePrompt(e.target.value)}
                disabled={isProcessing}
                rows={2}
                className="max-h-20 resize-none"
              />
            </div>

            {/* 생성 / 초기화 버튼 */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleGenerate}
                disabled={!sourceFile || isProcessing}
              >
                {isProcessing
                  ? `생성 중 (${progress.completed}/${progress.total})`
                  : `${AUTO_FITTING_POSE_COUNT}개 포즈 생성`}
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
          <CardContent>
            <AutoFittingResultGrid
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
