import type {
  VideoAspectRatio,
  VideoDuration,
  VideoMode,
} from "@/types/video";

export const VIDEO_ASPECT_RATIO_PRESETS: {
  value: VideoAspectRatio;
  label: string;
}[] = [
  { value: "9:16", label: "9:16 (세로)" },
  { value: "16:9", label: "16:9 (가로)" },
  { value: "1:1", label: "1:1 (정사각형)" },
];

export const VIDEO_DURATION_PRESETS: {
  value: VideoDuration;
  label: string;
}[] = [
  { value: "5", label: "5초" },
  { value: "10", label: "10초" },
];

export const VIDEO_MODE_PRESETS: { value: VideoMode; label: string }[] = [
  { value: "std", label: "표준 (Standard)" },
  { value: "pro", label: "고품질 (Pro)" },
];

export const VIDEO_PROMPT_CONSTRAINTS = {
  maxLength: 2500,
} as const;

export const VIDEO_POLLING_INTERVAL_MS = 3000;
export const VIDEO_POLLING_MAX_ATTEMPTS = 120;
export const VIDEO_COOLDOWN_MS = 3000;

/** @internal server-only */
export const VIDEO_MODEL = "kling-v2-6" as const;

export const DEFAULT_IMAGE_TO_VIDEO_OPTIONS = {
  aspectRatio: "16:9" as VideoAspectRatio,
  duration: "5" as VideoDuration,
  mode: "pro" as VideoMode,
  cfg_scale: 0.5,
};
