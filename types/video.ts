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
  userEmail?: string;
  userDisplayName?: string;
}

export type KlingModel = "kling-v2-6";

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

export interface ImageToVideoRequest {
  imageUrl: string;
  prompt?: string;
  negativePrompt?: string;
  aspectRatio: KlingAspectRatio;
  duration: KlingDuration;
  mode: KlingMode;
  cfg_scale: number;
}

export interface KlingImageToVideoApiRequest {
  model_name: KlingModel;
  image: string;
  prompt?: string;
  negative_prompt?: string;
  mode?: KlingMode;
  aspect_ratio?: KlingAspectRatio;
  duration?: KlingDuration;
  cfg_scale?: number;
}
