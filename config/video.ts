import type {
  KlingModel,
  KlingAspectRatio,
  KlingDuration,
  KlingMode,
} from "@/types/video";

export const KLING_MODEL_PRESETS: { value: KlingModel; label: string }[] = [
  { value: "kling-v2-6", label: "Kling V2.6 (최신)" },
  { value: "kling-v2-5-turbo", label: "Kling V2.5 Turbo" },
  { value: "kling-v2-1-master", label: "Kling V2.1 Master" },
  { value: "kling-v2-master", label: "Kling V2 Master" },
  { value: "kling-v1-6", label: "Kling V1.6" },
  { value: "kling-v1", label: "Kling V1" },
];

export const KLING_ASPECT_RATIO_PRESETS: {
  value: KlingAspectRatio;
  label: string;
}[] = [
  { value: "9:16", label: "9:16 (세로)" },
  { value: "16:9", label: "16:9 (가로)" },
  { value: "1:1", label: "1:1 (정사각형)" },
];

export const KLING_DURATION_PRESETS: {
  value: KlingDuration;
  label: string;
}[] = [
  { value: "5", label: "5초" },
  { value: "10", label: "10초" },
];

export const KLING_MODE_PRESETS: { value: KlingMode; label: string }[] = [
  { value: "std", label: "표준 (Standard)" },
  { value: "pro", label: "고품질 (Pro)" },
];

export const VIDEO_PROMPT_CONSTRAINTS = {
  maxLength: 2500,
} as const;

export const VIDEO_POLLING_INTERVAL_MS = 3000;
export const VIDEO_POLLING_MAX_ATTEMPTS = 120;
export const VIDEO_COOLDOWN_MS = 3000;

export const DEFAULT_IMAGE_TO_VIDEO_OPTIONS = {
  model: "kling-v2-6" as KlingModel,
  aspectRatio: "16:9" as KlingAspectRatio,
  duration: "5" as KlingDuration,
  mode: "pro" as KlingMode,
  cfg_scale: 0.5,
};
