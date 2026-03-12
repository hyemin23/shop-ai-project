import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  StudioType,
  GenerationMode,
  AspectRatio,
  ImageSize,
} from "@/types/studio";

export interface ImageInput {
  base64: string;
  mimeType: string;
}

export interface PromptBuildResult {
  prompt: string;
  images: ImageInput[];
  historyParams: Record<string, unknown>;
}

export interface ProcessOptions {
  type: StudioType;
  mode: GenerationMode;
  sourceFile: File;
  referenceFile?: File | null;
  targetColor?: string;
  garmentRegion?: string;
  poseType?: "preset" | "custom";
  presetId?: string;
  poseReferenceFile?: File | null;
  extractionMode?: "rose-cut" | "4-split" | "nukki";
  detailPresets?: string[];
  garmentCategory?: string;
  autoFittingStylePrompt?: string;
  ugcGender?: string;
  ugcAgeGroup?: string;
  ugcSceneDescription?: string;
  userId: string | null;
  sessionId: string;
  batchId?: string;
  skipTrialCheck?: boolean;
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  userPrompt?: string;
  /** Skip individual token spend when tokens are pre-reserved at batch level */
  skipTokenSpend?: boolean;
}

export interface ProcessResult {
  success: boolean;
  resultImageUrl?: string;
  historyId?: string;
  modelUsed?: string;
  fallbackUsed?: boolean;
  processingTime: number;
  error?: string;
  code?: string;
  retryable?: boolean;
}

/**
 * Strategy interface for each StudioType processor.
 * Each processor handles validation and prompt/image construction
 * for its specific studio type.
 */
export interface StudioTypeProcessor {
  validate(options: ProcessOptions): void;
  buildPromptAndImages(
    options: ProcessOptions,
    supabase: SupabaseClient,
  ): Promise<PromptBuildResult>;
}
