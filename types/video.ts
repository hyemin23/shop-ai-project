// Video types

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

// Public types (included in client bundle)
export type VideoAspectRatio = "16:9" | "9:16" | "1:1";
export type VideoDuration = "5" | "10";
export type VideoMode = "std" | "pro";

export type VideoGenerationStatus =
  | "idle"
  | "submitting"
  | "polling"
  | "succeed"
  | "failed";

export interface ImageToVideoRequest {
  imageUrl: string;
  prompt?: string;
  negativePrompt?: string;
  aspectRatio: VideoAspectRatio;
  duration: VideoDuration;
  mode: VideoMode;
  cfg_scale: number;
}

// Server-only types (not included in client bundle)
export type VideoTaskStatus = "submitted" | "processing" | "succeed" | "failed";

export interface VideoApiResult {
  id: string;
  url: string;
  duration: string;
}

export interface VideoApiResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    task_status: VideoTaskStatus;
    task_status_msg?: string;
    task_result?: {
      videos?: VideoApiResult[];
    };
    created_at?: number;
    updated_at?: number;
  };
}

export interface VideoApiRequest {
  model_name: string;
  image: string;
  prompt?: string;
  negative_prompt?: string;
  mode?: VideoMode;
  aspect_ratio?: VideoAspectRatio;
  duration?: VideoDuration;
  cfg_scale?: number;
}
