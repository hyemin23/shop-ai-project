import { type BatchItemStatus } from "@/types/batch";

export type UgcGender = "female" | "male";
export type UgcAgeGroup = "10s" | "20s" | "30s" | "40s+";
export type UgcSceneCategory = "indoor" | "outdoor" | "transport" | "leisure";

export interface UgcScenePreset {
  id: string;
  name: string;
  scene: string;
  category: UgcSceneCategory;
  emoji: string;
}

export interface UgcSSEEvent {
  type: "item_start" | "item_complete" | "item_error" | "batch_complete";
  index: number;
  total: number;
  status: BatchItemStatus;
  sceneName?: string;
  resultImageUrl?: string;
  error?: string;
  processingTime?: number;
  batchId?: string;
}

export interface UgcItemState {
  index: number;
  sceneId: string;
  sceneName: string;
  status: BatchItemStatus;
  resultImageUrl?: string;
  error?: string;
  processingTime?: number;
}

export const UGC_MAX_SCENES = 10;
