"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Monitor, Camera } from "lucide-react";
import { ImageUploadZone } from "@/components/studio/image-upload-zone";
import { ImageOptionsSelector } from "@/components/studio/image-options-selector";
import { UgcTargetSelector } from "@/components/studio/ugc-target-selector";
import { UgcSceneGrid } from "@/components/studio/ugc-scene-grid";
import { UgcResultGrid } from "@/components/studio/ugc-result-grid";
import { TokenInsufficientDialog } from "@/components/studio/token-insufficient-dialog";
import { useUgcGenerate } from "@/hooks/use-ugc-generate";
import { type ImageGenerationOptions } from "@/types/studio";
import { type UgcGender, type UgcAgeGroup } from "@/types/ugc";
import { getUgcScenesForTarget } from "@/config/ugc";
import { toast } from "sonner";

export default function UgcPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [gender, setGender] = useState<UgcGender>("female");
  const [ageGroup, setAgeGroup] = useState<UgcAgeGroup>("20s");
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [imageOptions, setImageOptions] = useState<ImageGenerationOptions>({
    aspectRatio: "9:16",
    imageSize: "1K",
  });
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const scenes = useMemo(
    () => getUgcScenesForTarget(gender, ageGroup),
    [gender, ageGroup],
  );

  const selectedScenes = useMemo(
    () =>
      selectedSceneIds
        .map((id) => scenes.find((s) => s.id === id))
        .filter(Boolean) as typeof scenes,
    [selectedSceneIds, scenes],
  );

  const { items, isProcessing, progress, generate, reset, downloadZip } =
    useUgcGenerate({
      onComplete: () => {
        toast.success("UGC 이미지 생성이 완료되었습니다.");
      },
      onError: (error) => {
        toast.error(error);
      },
      onTokenInsufficient: () => {
        setTokenDialogOpen(true);
      },
    });

  // 타겟 변경 시 선택 초기화 (새 장소 목록에 없는 ID 제거)
  const handleGenderChange = useCallback(
    (newGender: UgcGender) => {
      setGender(newGender);
      const newScenes = getUgcScenesForTarget(newGender, ageGroup);
      const newIds = new Set(newScenes.map((s) => s.id));
      setSelectedSceneIds((prev) => prev.filter((id) => newIds.has(id)));
    },
    [ageGroup],
  );

  const handleAgeGroupChange = useCallback(
    (newAgeGroup: UgcAgeGroup) => {
      setAgeGroup(newAgeGroup);
      const newScenes = getUgcScenesForTarget(gender, newAgeGroup);
      const newIds = new Set(newScenes.map((s) => s.id));
      setSelectedSceneIds((prev) => prev.filter((id) => newIds.has(id)));
    },
    [gender],
  );

  const handleGenerate = useCallback(async () => {
    if (!sourceFile || selectedScenes.length === 0) return;

    const formData = new FormData();
    formData.set("sourceImage", sourceFile);
    formData.set("gender", gender);
    formData.set("ageGroup", ageGroup);
    formData.set("selectedScenes", JSON.stringify(selectedSceneIds));

    if (imageOptions.imageSize) {
      formData.set("imageSize", imageOptions.imageSize);
    }
    if (imageOptions.aspectRatio) {
      formData.set("aspectRatio", imageOptions.aspectRatio);
    }

    if (userPrompt.trim()) {
      formData.set("userPrompt", userPrompt.trim());
    }

    await generate(
      formData,
      selectedScenes.map((s) => ({ id: s.id, name: s.name })),
    );
  }, [sourceFile, gender, ageGroup, selectedSceneIds, selectedScenes, imageOptions, userPrompt, generate]);

  const handleReset = useCallback(() => {
    setSourceFile(null);
    setUserPrompt("");
    setSelectedSceneIds([]);
    reset();
  }, [reset]);

  return (
    <div className="space-y-6">
      {/* 모바일 배너 */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 lg:hidden">
        <Monitor className="h-4 w-4 shrink-0" />
        <p>UGC 이미지 생성은 데스크톱에서 더 편리하게 사용할 수 있습니다.</p>
      </div>

      {/* 페이지 헤더 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">UGC 이미지</h1>
        <p className="text-muted-foreground">
          타겟 고객에 맞는 현실적인 UGC 스타일 이미지를 AI로 생성합니다. SNS 광고 소재로 바로 사용 가능합니다.
        </p>
      </div>

      {/* 2컬럼 그리드 레이아웃 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 입력 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 의류 이미지 업로드 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">의류 이미지</label>
              <ImageUploadZone
                label="의류 이미지"
                description="UGC 이미지에 사용할 원본 의류 사진"
                onFileSelect={setSourceFile}
              />
            </div>

            {/* 타겟 선택 */}
            <UgcTargetSelector
              gender={gender}
              ageGroup={ageGroup}
              onGenderChange={handleGenderChange}
              onAgeGroupChange={handleAgeGroupChange}
              disabled={isProcessing}
            />

            {/* 장소 선택 그리드 */}
            <UgcSceneGrid
              gender={gender}
              ageGroup={ageGroup}
              selectedIds={selectedSceneIds}
              onSelectedChange={setSelectedSceneIds}
              disabled={isProcessing}
            />

            {/* 이미지 생성 옵션 */}
            <ImageOptionsSelector
              options={imageOptions}
              onOptionsChange={setImageOptions}
              creditCount={selectedScenes.length || 1}
              creditLabel="장면"
            />

            {/* 추가 프롬프트 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                추가 프롬프트{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (선택)
                </span>
              </label>
              <Textarea
                placeholder="예: 자연스러운 미소, 밝은 분위기..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
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
                disabled={!sourceFile || selectedScenes.length === 0 || isProcessing}
              >
                {isProcessing
                  ? `생성 중 (${progress.completed}/${progress.total})`
                  : `${selectedScenes.length}개 장면 생성`}
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
            <UgcResultGrid
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
