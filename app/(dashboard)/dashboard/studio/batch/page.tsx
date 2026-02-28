"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor, Layers } from "lucide-react";
import { BatchUploadZone } from "@/components/studio/batch-upload-zone";
import { BatchProgressPanel } from "@/components/studio/batch-progress-panel";
import { BatchResultGrid } from "@/components/studio/batch-result-grid";
import { ModeSelector } from "@/components/studio/mode-selector";
import { ColorPicker } from "@/components/studio/color-picker";
import { PosePresetGallery } from "@/components/studio/pose-preset-gallery";
import { ImageUploadZone } from "@/components/studio/image-upload-zone";
import { useBatchGenerate } from "@/hooks/use-batch-generate";
import { type StudioType, type GenerationMode } from "@/types/studio";

export default function BatchPage() {
  const [type, setType] = useState<StudioType>("try-on");
  const [mode, setMode] = useState<GenerationMode>("standard");
  const [files, setFiles] = useState<File[]>([]);

  // 공통 파라미터 (타입별)
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [targetColor, setTargetColor] = useState("#000000");
  const [garmentRegion, setGarmentRegion] = useState("auto");
  const [poseType, setPoseType] = useState<"preset" | "custom">("preset");
  const [presetId, setPresetId] = useState("front-standing");

  const { items, isProcessing, progress, generate, reset, downloadZip } =
    useBatchGenerate({
      type,
      mode,
      onComplete: () => {},
    });

  const handleGenerate = useCallback(async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.set(`sourceImage_${index}`, file);
    });

    // 타입별 파라미터 추가
    if (type === "try-on" && referenceFile) {
      formData.set("referenceImage", referenceFile);
    }
    if (type === "color-swap") {
      formData.set("targetColor", targetColor);
      formData.set("garmentRegion", garmentRegion);
    }
    if (type === "pose-transfer") {
      formData.set("poseType", poseType);
      if (poseType === "preset") {
        formData.set("presetId", presetId);
      }
    }

    await generate(formData);
  }, [
    files,
    type,
    referenceFile,
    targetColor,
    garmentRegion,
    poseType,
    presetId,
    generate,
  ]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setReferenceFile(null);
    reset();
  }, [reset]);

  return (
    <div className="space-y-6">
      {/* 모바일 배너 */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 lg:hidden">
        <Monitor className="h-4 w-4 shrink-0" />
        <p>배치 처리는 데스크톱에서 더 편리하게 사용할 수 있습니다.</p>
      </div>

      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">배치 처리</h1>
          <p className="text-muted-foreground">
            최대 10장의 이미지를 한번에 처리합니다.
          </p>
        </div>
        <ModeSelector mode={mode} onModeChange={setMode} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 입력 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              입력
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 작업 유형 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">작업 유형</label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as StudioType)}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="try-on">의류 교체</SelectItem>
                  <SelectItem value="color-swap">색상 변경</SelectItem>
                  <SelectItem value="pose-transfer">포즈 변경</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 타입별 옵션 */}
            {type === "try-on" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">참조 의류 이미지</label>
                <ImageUploadZone
                  label="참조 의류 이미지"
                  description="모든 소스 이미지에 적용할 의류"
                  onFileSelect={setReferenceFile}
                />
                {referenceFile && (
                  <p className="text-xs text-muted-foreground">
                    선택됨: {referenceFile.name}
                  </p>
                )}
              </div>
            )}

            {type === "color-swap" && (
              <div className="space-y-3">
                <ColorPicker selectedColor={targetColor} onColorSelect={setTargetColor} />
                <div className="space-y-2">
                  <label className="text-sm font-medium">영역</label>
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
              </div>
            )}

            {type === "pose-transfer" && (
              <div className="space-y-2">
                <Select
                  value={poseType}
                  onValueChange={(v) => setPoseType(v as "preset" | "custom")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preset">프리셋 포즈</SelectItem>
                    <SelectItem value="custom">커스텀 포즈</SelectItem>
                  </SelectContent>
                </Select>
                {poseType === "preset" && (
                  <PosePresetGallery
                    selectedPresetId={presetId}
                    onPresetSelect={setPresetId}
                  />
                )}
              </div>
            )}

            {/* 소스 이미지 업로드 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">소스 이미지</label>
              <BatchUploadZone
                files={files}
                onFilesChange={setFiles}
                disabled={isProcessing}
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleGenerate}
                disabled={
                  files.length === 0 ||
                  isProcessing ||
                  (type === "try-on" && !referenceFile)
                }
              >
                {isProcessing
                  ? `처리 중 (${progress.completed}/${progress.total})`
                  : `${files.length}장 배치 처리 시작`}
              </Button>
              {items.length > 0 && (
                <Button variant="outline" onClick={handleReset}>
                  초기화
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 결과 */}
        <Card>
          <CardHeader>
            <CardTitle>결과</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BatchProgressPanel items={items} isProcessing={isProcessing} />
            <BatchResultGrid
              items={items}
              onDownloadAll={downloadZip}
              isProcessing={isProcessing}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
