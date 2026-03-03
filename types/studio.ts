// Studio core types - PRD 5.4절 기반

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type ImageSize = "1k" | "2k" | "4k";

export interface ImageGenerationOptions {
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
}

export type GeminiModel =
  | "gemini-2.5-flash-image"
  | "gemini-3-pro-image-preview";

export type GenerationMode = "standard" | "premium";

export type StudioStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "success"
  | "error";

export type StudioType = "try-on" | "color-swap" | "pose-transfer";

export interface StudioBaseRequest {
  sourceImage: string;
}

export interface StudioBaseResponse {
  success: boolean;
  resultImageUrl?: string;
  resultThumbUrl?: string;
  historyId?: string;
  modelUsed?: GeminiModel;
  fallbackUsed?: boolean;
  error?: string;
  processingTime?: number;
}

export interface TryOnRequest extends StudioBaseRequest {
  referenceImage: string;
}

export interface ColorSwapRequest extends StudioBaseRequest {
  targetColor: string;
  garmentRegion?: "auto" | "top" | "bottom" | "dress";
}

export interface PoseTransferRequest extends StudioBaseRequest {
  poseType: "preset" | "custom";
  presetId?: string;
  poseReferenceImage?: string;
}

export interface PosePreset {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
}

export interface ColorPreset {
  name: string;
  hex: string;
  nameKo: string;
}

export interface StudioHistoryItem {
  id: string;
  sessionId: string;
  userId?: string;
  createdAt: string;
  type: StudioType;
  mode: GenerationMode;
  sourceImageUrl: string;
  resultImageUrl: string;
  sourceThumbUrl?: string;
  resultThumbUrl?: string;
  params: TryOnRequest | ColorSwapRequest | PoseTransferRequest;
  modelUsed: GeminiModel;
  fallbackUsed: boolean;
  processingTime: number;
}
