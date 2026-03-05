"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Coins,
  Video,
  Upload,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  KLING_MODEL_PRESETS,
  KLING_ASPECT_RATIO_PRESETS,
  KLING_DURATION_PRESETS,
  KLING_MODE_PRESETS,
  DEFAULT_IMAGE_TO_VIDEO_OPTIONS,
  VIDEO_PROMPT_CONSTRAINTS,
  CAMERA_MOVEMENT_PRESETS,
  VIDEO_STYLE_PRESETS,
  VIDEO_LIGHTING_PRESETS,
  VIDEO_COLOR_GRADING_PRESETS,
  VIDEO_RESOLUTION_PRESETS,
  VIDEO_FPS_PRESETS,
  VIDEO_SOUND_PRESETS,
} from "@/config/video";
import { VIDEO_CREDIT_COST } from "@/config/pricing";
import type {
  KlingModel,
  KlingAspectRatio,
  KlingDuration,
  KlingMode,
  CameraMovement,
  VideoStyle,
  VideoLighting,
  VideoColorGrading,
  VideoResolution,
  VideoFps,
  VideoSound,
  ImageToVideoRequest,
  VideoGenerationStatus,
} from "@/types/video";
import { toast } from "sonner";

interface ImageToVideoFormProps {
  status: VideoGenerationStatus;
  isOnline: boolean;
  onSubmit: (params: ImageToVideoRequest) => void;
}

export function ImageToVideoForm({
  status,
  isOnline,
  onSubmit,
}: ImageToVideoFormProps) {
  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Basic options
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [model, setModel] = useState<KlingModel>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.model,
  );
  const [aspectRatio, setAspectRatio] = useState<KlingAspectRatio>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.aspectRatio,
  );
  const [duration, setDuration] = useState<KlingDuration>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.duration,
  );
  const [mode, setMode] = useState<KlingMode>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.mode,
  );
  const [cfgScale, setCfgScale] = useState(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.cfg_scale,
  );
  const [motionStrength, setMotionStrength] = useState(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.motionStrength,
  );
  const [cameraMovement, setCameraMovement] = useState<CameraMovement>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.cameraMovement,
  );

  // Advanced options
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [fps, setFps] = useState<VideoFps>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.fps,
  );
  const [resolution, setResolution] = useState<VideoResolution>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.resolution,
  );
  const [lighting, setLighting] = useState<VideoLighting>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.lighting,
  );
  const [colorGrading, setColorGrading] = useState<VideoColorGrading>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.colorGrading,
  );
  const [videoStyle, setVideoStyle] = useState<VideoStyle>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.style,
  );
  const [sound, setSound] = useState<VideoSound>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.sound,
  );

  const isBusy = status === "submitting" || status === "polling";
  const isDisabled = !imageFile || !isOnline || isBusy || isUploading;
  const creditCost = VIDEO_CREDIT_COST[duration] ?? 10;

  async function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("이미지 크기는 10MB 이하여야 합니다.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isDisabled || !imageFile) return;

    setIsUploading(true);

    try {
      // Supabase Storage에 이미지 업로드
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const uploadData = await uploadRes.json();
        toast.error(uploadData.error || "이미지 업로드에 실패했습니다.");
        setIsUploading(false);
        return;
      }

      const uploadData = await uploadRes.json();

      setIsUploading(false);

      onSubmit({
        imageUrl: uploadData.url,
        prompt: prompt.trim() || undefined,
        negativePrompt: negativePrompt.trim() || undefined,
        model,
        aspectRatio,
        duration,
        mode,
        cfg_scale: cfgScale,
        motionStrength,
        cameraMovement,
        fps,
        resolution,
        lighting,
        colorGrading,
        style: videoStyle,
        sound,
      });
    } catch {
      setIsUploading(false);
      toast.error("이미지 업로드 중 오류가 발생했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>소스 이미지 *</Label>
        {imagePreview ? (
          <div className="relative overflow-hidden rounded-lg border">
            <Image
              src={imagePreview}
              alt="소스 이미지"
              width={400}
              height={300}
              className="h-48 w-full object-contain bg-muted"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={clearImage}
              disabled={isBusy}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              클릭하거나 이미지를 드래그해주세요
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP (최대 10MB)
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Prompt */}
      <div className="space-y-2">
        <Label htmlFor="i2v-prompt">모션 프롬프트</Label>
        <Textarea
          id="i2v-prompt"
          placeholder="원하는 움직임을 설명해주세요 (예: 걸어가는 모습)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={VIDEO_PROMPT_CONSTRAINTS.maxLength}
          rows={3}
          disabled={isBusy}
        />
        <p className="text-xs text-muted-foreground text-right">
          {prompt.length}/{VIDEO_PROMPT_CONSTRAINTS.maxLength}
        </p>
      </div>

      {/* Negative Prompt */}
      <div className="space-y-2">
        <Label htmlFor="i2v-neg-prompt">네거티브 프롬프트</Label>
        <Textarea
          id="i2v-neg-prompt"
          placeholder="원하지 않는 요소를 입력하세요 (선택사항)"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          maxLength={VIDEO_PROMPT_CONSTRAINTS.maxLength}
          rows={2}
          disabled={isBusy}
        />
      </div>

      {/* Model / Aspect Ratio / Duration / Mode */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>모델</Label>
          <Select
            value={model}
            onValueChange={(v) => setModel(v as KlingModel)}
            disabled={isBusy}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KLING_MODEL_PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>비율</Label>
          <Select
            value={aspectRatio}
            onValueChange={(v) => setAspectRatio(v as KlingAspectRatio)}
            disabled={isBusy}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KLING_ASPECT_RATIO_PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>길이</Label>
          <Select
            value={duration}
            onValueChange={(v) => setDuration(v as KlingDuration)}
            disabled={isBusy}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KLING_DURATION_PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>모드</Label>
          <Select
            value={mode}
            onValueChange={(v) => setMode(v as KlingMode)}
            disabled={isBusy}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KLING_MODE_PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* CFG Scale Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>프롬프트 충실도 (cfg_scale)</Label>
          <span className="text-sm text-muted-foreground">{cfgScale.toFixed(1)}</span>
        </div>
        <Slider
          value={[cfgScale]}
          onValueChange={([v]) => setCfgScale(v)}
          min={0}
          max={1}
          step={0.1}
          disabled={isBusy}
        />
        <p className="text-xs text-muted-foreground">
          낮을수록 자유로운 해석, 높을수록 프롬프트에 충실
        </p>
      </div>

      {/* Motion Strength Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>모션 강도</Label>
          <span className="text-sm text-muted-foreground">
            {motionStrength.toFixed(1)}
          </span>
        </div>
        <Slider
          value={[motionStrength]}
          onValueChange={([v]) => setMotionStrength(v)}
          min={0}
          max={1}
          step={0.1}
          disabled={isBusy}
        />
        <p className="text-xs text-muted-foreground">
          낮을수록 미세한 움직임, 높을수록 역동적인 움직임
        </p>
      </div>

      {/* Camera Movement */}
      <div className="space-y-2">
        <Label>카메라 움직임</Label>
        <Select
          value={cameraMovement}
          onValueChange={(v) => setCameraMovement(v as CameraMovement)}
          disabled={isBusy}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CAMERA_MOVEMENT_PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Options */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between"
          >
            고급 설정
            <ChevronDown
              className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>해상도</Label>
              <Select
                value={resolution}
                onValueChange={(v) => setResolution(v as VideoResolution)}
                disabled={isBusy}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_RESOLUTION_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>FPS</Label>
              <Select
                value={String(fps)}
                onValueChange={(v) => setFps(Number(v) as VideoFps)}
                disabled={isBusy}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_FPS_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={String(p.value)}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>스타일</Label>
              <Select
                value={videoStyle}
                onValueChange={(v) => setVideoStyle(v as VideoStyle)}
                disabled={isBusy}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_STYLE_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>조명</Label>
              <Select
                value={lighting}
                onValueChange={(v) => setLighting(v as VideoLighting)}
                disabled={isBusy}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_LIGHTING_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>컬러 그레이딩</Label>
              <Select
                value={colorGrading}
                onValueChange={(v) => setColorGrading(v as VideoColorGrading)}
                disabled={isBusy}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_COLOR_GRADING_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>사운드</Label>
              <Select
                value={sound}
                onValueChange={(v) => setSound(v as VideoSound)}
                disabled={isBusy}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_SOUND_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Credit Cost */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="h-4 w-4" />
          <span>예상 소모 토큰</span>
        </div>
        <span className="text-sm font-semibold">{creditCost} 토큰</span>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg" disabled={isDisabled}>
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            이미지 업로드 중...
          </>
        ) : isBusy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            생성 중...
          </>
        ) : (
          <>
            <Video className="mr-2 h-4 w-4" />
            영상 생성
          </>
        )}
      </Button>
    </form>
  );
}
