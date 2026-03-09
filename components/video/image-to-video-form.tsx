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
  Coins,
  Video,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import {
  VIDEO_ASPECT_RATIO_PRESETS,
  VIDEO_DURATION_PRESETS,
  VIDEO_MODE_PRESETS,
  DEFAULT_IMAGE_TO_VIDEO_OPTIONS,
  VIDEO_PROMPT_CONSTRAINTS,
} from "@/config/video";
import { VIDEO_CREDIT_COST } from "@/config/pricing";
import type {
  VideoAspectRatio,
  VideoDuration,
  VideoMode,
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

  // Options
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.aspectRatio,
  );
  const [duration, setDuration] = useState<VideoDuration>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.duration,
  );
  const [mode, setMode] = useState<VideoMode>(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.mode,
  );
  const [cfgScale, setCfgScale] = useState(
    DEFAULT_IMAGE_TO_VIDEO_OPTIONS.cfg_scale,
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
        aspectRatio,
        duration,
        mode,
        cfg_scale: cfgScale,
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

      {/* Aspect Ratio / Duration / Mode */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>비율</Label>
          <Select
            value={aspectRatio}
            onValueChange={(v) => setAspectRatio(v as VideoAspectRatio)}
            disabled={isBusy}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIDEO_ASPECT_RATIO_PRESETS.map((p) => (
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
            onValueChange={(v) => setDuration(v as VideoDuration)}
            disabled={isBusy}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIDEO_DURATION_PRESETS.map((p) => (
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
            onValueChange={(v) => setMode(v as VideoMode)}
            disabled={isBusy}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIDEO_MODE_PRESETS.map((p) => (
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
          <Label>프롬프트 충실도</Label>
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
