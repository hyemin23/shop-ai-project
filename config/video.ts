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

export const DEFAULT_VIDEO_OPTIONS = {
  model: "kling-v2-6" as KlingModel,
  aspectRatio: "9:16" as KlingAspectRatio,
  duration: "5" as KlingDuration,
  mode: "std" as KlingMode,
};

export const VIDEO_PROMPT_CONSTRAINTS = {
  maxLength: 2500,
} as const;

export const VIDEO_POLLING_INTERVAL_MS = 3000;
export const VIDEO_POLLING_MAX_ATTEMPTS = 120;
export const VIDEO_COOLDOWN_MS = 3000;

// Image-to-Video presets

export const DEFAULT_IMAGE_TO_VIDEO_OPTIONS = {
  model: "kling-v2-6" as KlingModel,
  aspectRatio: "16:9" as KlingAspectRatio,
  duration: "5" as KlingDuration,
  mode: "pro" as KlingMode,
  cfg_scale: 0.5,
  motionStrength: 0.5,
  cameraMovement: "static" as CameraMovement,
  fps: 24 as VideoFps,
  resolution: "4K" as VideoResolution,
  lighting: "natural" as VideoLighting,
  colorGrading: "none" as VideoColorGrading,
  style: "photorealistic" as VideoStyle,
  sound: "off" as VideoSound,
};

export const CAMERA_MOVEMENT_PRESETS: {
  value: CameraMovement;
  label: string;
}[] = [
  { value: "static", label: "고정" },
  { value: "zoom-in", label: "줌인" },
  { value: "zoom-out", label: "줌아웃" },
  { value: "pan-left", label: "좌로 이동" },
  { value: "pan-right", label: "우로 이동" },
  { value: "pan-up", label: "위로 이동" },
  { value: "pan-down", label: "아래로 이동" },
];

export const VIDEO_STYLE_PRESETS: { value: VideoStyle; label: string }[] = [
  { value: "photorealistic", label: "포토리얼" },
  { value: "cinematic", label: "시네마틱" },
  { value: "anime", label: "애니메이션" },
  { value: "3d-animation", label: "3D 애니메이션" },
];

export const VIDEO_LIGHTING_PRESETS: {
  value: VideoLighting;
  label: string;
}[] = [
  { value: "natural", label: "자연광" },
  { value: "studio", label: "스튜디오" },
  { value: "dramatic", label: "드라마틱" },
  { value: "warm", label: "따뜻한" },
  { value: "cool", label: "차가운" },
];

export const VIDEO_COLOR_GRADING_PRESETS: {
  value: VideoColorGrading;
  label: string;
}[] = [
  { value: "none", label: "없음" },
  { value: "cinematic", label: "시네마틱" },
  { value: "vintage", label: "빈티지" },
  { value: "cold", label: "차가운" },
  { value: "warm", label: "따뜻한" },
];

export const VIDEO_RESOLUTION_PRESETS: {
  value: VideoResolution;
  label: string;
}[] = [
  { value: "1080p", label: "1080p (Full HD)" },
  { value: "4K", label: "4K (Ultra HD)" },
];

export const VIDEO_FPS_PRESETS: { value: VideoFps; label: string }[] = [
  { value: 24, label: "24 fps" },
  { value: 30, label: "30 fps" },
];

export const VIDEO_SOUND_PRESETS: { value: VideoSound; label: string }[] = [
  { value: "off", label: "끄기" },
  { value: "on", label: "켜기" },
];
