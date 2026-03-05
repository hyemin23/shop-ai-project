// Video (Kling AI) types

// Generation Log types (shared across studio & video)
export type GenerationLogStatus =
  | "initiated"
  | "processing"
  | "tokens_spent"
  | "succeed"
  | "failed"
  | "refunded"
  | "abandoned";

export type GenerationServiceType = "studio" | "video";

export interface GenerationLog {
  id: string;
  userId: string | null;
  sessionId: string;
  serviceType: GenerationServiceType;
  action: string;
  params: Record<string, unknown>;
  tokensCharged: number;
  tokensRefunded: number;
  status: GenerationLogStatus;
  externalTaskId?: string;
  referenceId?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type KlingModel =
  | "kling-v1"
  | "kling-v1-6"
  | "kling-v2-master"
  | "kling-v2-1-master"
  | "kling-v2-5-turbo"
  | "kling-v2-6";

export type KlingAspectRatio = "16:9" | "9:16" | "1:1";
export type KlingDuration = "5" | "10";
export type KlingMode = "std" | "pro";
export type KlingTaskStatus = "submitted" | "processing" | "succeed" | "failed";

export type VideoGenerationStatus =
  | "idle"
  | "submitting"
  | "polling"
  | "succeed"
  | "failed";

export interface TextToVideoRequest {
  prompt: string;
  negativePrompt?: string;
  model: KlingModel;
  aspectRatio: KlingAspectRatio;
  duration: KlingDuration;
  mode: KlingMode;
}

export interface KlingApiRequest {
  model_name: KlingModel;
  prompt: string;
  negative_prompt?: string;
  mode?: KlingMode;
  aspect_ratio?: KlingAspectRatio;
  duration?: KlingDuration;
}

export interface KlingVideoResult {
  id: string;
  url: string;
  duration: string;
}

export interface KlingApiResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    task_status: KlingTaskStatus;
    task_status_msg?: string;
    task_result?: {
      videos?: KlingVideoResult[];
    };
    created_at?: number;
    updated_at?: number;
  };
}

// Image-to-Video types

export type CameraMovement =
  | "static"
  | "zoom-in"
  | "zoom-out"
  | "pan-left"
  | "pan-right"
  | "pan-up"
  | "pan-down";

export type VideoStyle = "photorealistic" | "cinematic" | "anime" | "3d-animation";
export type VideoLighting = "natural" | "studio" | "dramatic" | "warm" | "cool";
export type VideoColorGrading = "none" | "cinematic" | "vintage" | "cold" | "warm";
export type VideoResolution = "1080p" | "4K";
export type VideoFps = 24 | 30;
export type VideoSound = "off" | "on";

export interface ImageToVideoRequest {
  imageUrl: string;
  prompt?: string;
  negativePrompt?: string;
  model: KlingModel;
  aspectRatio: KlingAspectRatio;
  duration: KlingDuration;
  mode: KlingMode;
  cfg_scale: number;
  motionStrength: number;
  cameraMovement: CameraMovement;
  fps: VideoFps;
  resolution: VideoResolution;
  lighting: VideoLighting;
  colorGrading: VideoColorGrading;
  style: VideoStyle;
  sound: VideoSound;
}

export interface KlingImageToVideoApiRequest {
  model_name: KlingModel;
  image?: string;
  image_url?: string;
  prompt?: string;
  negative_prompt?: string;
  mode?: KlingMode;
  aspect_ratio?: KlingAspectRatio;
  duration?: KlingDuration;
  cfg_scale?: number;
}
