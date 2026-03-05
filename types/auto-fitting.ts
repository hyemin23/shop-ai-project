import { type BatchItemStatus } from "@/types/batch";

export const AUTO_FITTING_POSE_COUNT = 5;

export interface AutoFittingPosePreset {
  id: string;
  name: string;
  description: string; // Gemini 프롬프트용 영문
}

export interface AutoFittingSSEEvent {
  type: "item_start" | "item_complete" | "item_error" | "batch_complete";
  index: number;
  total: number;
  status: BatchItemStatus;
  poseName?: string;
  resultImageUrl?: string;
  error?: string;
  processingTime?: number;
  batchId?: string;
}

export interface AutoFittingItemState {
  index: number;
  poseName: string;
  poseDescription: string;
  status: BatchItemStatus;
  resultImageUrl?: string;
  error?: string;
  processingTime?: number;
}
