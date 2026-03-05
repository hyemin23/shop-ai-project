"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Coins, Video } from "lucide-react";
import {
  KLING_MODEL_PRESETS,
  KLING_ASPECT_RATIO_PRESETS,
  KLING_DURATION_PRESETS,
  KLING_MODE_PRESETS,
  DEFAULT_VIDEO_OPTIONS,
  VIDEO_PROMPT_CONSTRAINTS,
} from "@/config/video";
import { VIDEO_CREDIT_COST } from "@/config/pricing";
import type {
  KlingModel,
  KlingAspectRatio,
  KlingDuration,
  KlingMode,
  TextToVideoRequest,
  VideoGenerationStatus,
} from "@/types/video";

interface TextToVideoFormProps {
  status: VideoGenerationStatus;
  isOnline: boolean;
  onSubmit: (params: TextToVideoRequest) => void;
}

export function TextToVideoForm({
  status,
  isOnline,
  onSubmit,
}: TextToVideoFormProps) {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [model, setModel] = useState<KlingModel>(DEFAULT_VIDEO_OPTIONS.model);
  const [aspectRatio, setAspectRatio] = useState<KlingAspectRatio>(
    DEFAULT_VIDEO_OPTIONS.aspectRatio,
  );
  const [duration, setDuration] = useState<KlingDuration>(
    DEFAULT_VIDEO_OPTIONS.duration,
  );
  const [mode, setMode] = useState<KlingMode>(DEFAULT_VIDEO_OPTIONS.mode);

  const isDisabled =
    !prompt.trim() ||
    !isOnline ||
    status === "submitting" ||
    status === "polling";

  const creditCost = VIDEO_CREDIT_COST[duration] ?? 10;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isDisabled) return;

    onSubmit({
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      model,
      aspectRatio,
      duration,
      mode,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="prompt">프롬프트 *</Label>
        <Textarea
          id="prompt"
          placeholder="생성하고 싶은 영상을 자세히 설명해주세요..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={VIDEO_PROMPT_CONSTRAINTS.maxLength}
          rows={4}
          disabled={status === "submitting" || status === "polling"}
        />
        <p className="text-xs text-muted-foreground text-right">
          {prompt.length}/{VIDEO_PROMPT_CONSTRAINTS.maxLength}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="negativePrompt">네거티브 프롬프트</Label>
        <Textarea
          id="negativePrompt"
          placeholder="원하지 않는 요소를 입력하세요 (선택사항)"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          maxLength={VIDEO_PROMPT_CONSTRAINTS.maxLength}
          rows={2}
          disabled={status === "submitting" || status === "polling"}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>모델</Label>
          <Select
            value={model}
            onValueChange={(v) => setModel(v as KlingModel)}
            disabled={status === "submitting" || status === "polling"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KLING_MODEL_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
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
            disabled={status === "submitting" || status === "polling"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KLING_ASPECT_RATIO_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
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
            disabled={status === "submitting" || status === "polling"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KLING_DURATION_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
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
            disabled={status === "submitting" || status === "polling"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KLING_MODE_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="h-4 w-4" />
          <span>예상 소모 토큰</span>
        </div>
        <span className="text-sm font-semibold">{creditCost} 토큰</span>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isDisabled}>
        <Video className="mr-2 h-4 w-4" />
        {status === "submitting" || status === "polling"
          ? "생성 중..."
          : "영상 생성"}
      </Button>
    </form>
  );
}
