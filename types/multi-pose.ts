import { type BatchItemStatus } from "@/types/batch";

export const MAX_POSE_VARIATIONS = 5;

export interface MultiPoseItemState {
  index: number; // 원본 인덱스 (0~4)
  prompt: string; // 사용자 입력 포즈 설명
  status: BatchItemStatus;
  resultImageUrl?: string;
  error?: string;
  processingTime?: number;
}

export interface MultiPoseSSEEvent {
  type: "item_start" | "item_complete" | "item_error" | "batch_complete";
  index: number;
  total: number;
  status: BatchItemStatus;
  prompt?: string;
  resultImageUrl?: string;
  error?: string;
  processingTime?: number;
  batchId?: string;
}
