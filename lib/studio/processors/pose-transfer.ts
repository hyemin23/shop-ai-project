import { processImageFile } from "@/lib/image-utils";
import { PROMPTS } from "@/config/prompts";
import { POSE_PRESETS } from "@/config/studio";
import type {
  StudioTypeProcessor,
  ProcessOptions,
  PromptBuildResult,
} from "../types";

export class PoseTransferProcessor implements StudioTypeProcessor {
  validate(options: ProcessOptions): void {
    if (options.poseType === "preset") {
      const preset = POSE_PRESETS.find((p) => p.id === options.presetId);
      if (!preset) {
        throw new ValidationError("유효하지 않은 포즈 프리셋입니다.");
      }
    } else if (!options.poseReferenceFile) {
      throw new ValidationError("포즈 참조 이미지가 필요합니다.");
    }
  }

  async buildPromptAndImages(options: ProcessOptions): Promise<PromptBuildResult> {
    const images = [];
    const historyParams: Record<string, unknown> = {};
    let poseDescription: string;

    if (options.poseType === "preset") {
      const preset = POSE_PRESETS.find((p) => p.id === options.presetId)!;
      poseDescription = preset.description;
    } else {
      const poseRefProcessed = await processImageFile(
        options.poseReferenceFile!,
      );
      images.push({
        base64: poseRefProcessed.base64,
        mimeType: poseRefProcessed.mimeType,
      });
      poseDescription =
        "Match the pose shown in the reference pose image exactly.";
    }

    const prompt = PROMPTS.poseTransfer(poseDescription, options.userPrompt);
    historyParams.poseType = options.poseType;
    if (options.presetId) historyParams.presetId = options.presetId;
    if (options.poseType === "custom")
      historyParams.poseReferenceImage = "uploaded";

    return { prompt, images, historyParams };
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
