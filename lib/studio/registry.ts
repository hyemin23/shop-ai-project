import type { StudioType } from "@/types/studio";
import type { StudioTypeProcessor } from "./types";
import { TryOnProcessor } from "./processors/try-on";
import { ColorSwapProcessor } from "./processors/color-swap";
import { PoseTransferProcessor } from "./processors/pose-transfer";
import { MultiPoseProcessor } from "./processors/multi-pose";
import { BackgroundSwapProcessor } from "./processors/background-swap";
import { AutoFittingProcessor } from "./processors/auto-fitting";
import { DetailExtractProcessor } from "./processors/detail-extract";
import { UgcProcessor } from "./processors/ugc";

const processorMap: Record<StudioType, StudioTypeProcessor> = {
  "try-on": new TryOnProcessor(),
  "color-swap": new ColorSwapProcessor(),
  "pose-transfer": new PoseTransferProcessor(),
  "multi-pose": new MultiPoseProcessor(),
  "background-swap": new BackgroundSwapProcessor(),
  "auto-fitting": new AutoFittingProcessor(),
  "detail-extract": new DetailExtractProcessor(),
  ugc: new UgcProcessor(),
};

export function getProcessor(type: StudioType): StudioTypeProcessor {
  const processor = processorMap[type];
  if (!processor) {
    throw new Error(`Unknown studio type: ${type}`);
  }
  return processor;
}
