import { type StudioType, type GenerationMode } from "@/types/studio";

export type BatchStatus = "pending" | "processing" | "completed" | "failed";
export type BatchItemStatus =
  | "pending"
  | "processing"
  | "success"
  | "error"
  | "skipped";

export interface BatchJob {
  id: string;
  sessionId: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  status: BatchStatus;
  type: StudioType;
  mode: GenerationMode;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  params: Record<string, unknown>;
}

export interface BatchItemState {
  index: number;
  fileName: string;
  status: BatchItemStatus;
  resultImageUrl?: string;
  error?: string;
  processingTime?: number;
}

export interface BatchParams {
  type: StudioType;
  mode: GenerationMode;
  // color-swap 전용
  targetColor?: string;
  garmentRegion?: string;
  // pose-transfer 전용
  poseType?: "preset" | "custom";
  presetId?: string;
  // try-on / pose-transfer: referenceImage는 FormData로 전달
}

export interface BatchSSEEvent {
  type: "item_start" | "item_complete" | "item_error" | "batch_complete";
  index: number;
  total: number;
  status: BatchItemStatus;
  resultImageUrl?: string;
  error?: string;
  processingTime?: number;
  batchId?: string;
}
