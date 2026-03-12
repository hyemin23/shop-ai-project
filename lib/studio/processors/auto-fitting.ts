import { PROMPTS } from "@/config/prompts";
import type {
  StudioTypeProcessor,
  ProcessOptions,
  PromptBuildResult,
} from "../types";

export class AutoFittingProcessor implements StudioTypeProcessor {
  validate(options: ProcessOptions): void {
    if (!options.userPrompt?.trim()) {
      throw new ValidationError("포즈 설명이 필요합니다.");
    }
  }

  async buildPromptAndImages(options: ProcessOptions): Promise<PromptBuildResult> {
    const historyParams: Record<string, unknown> = {};
    const poseDesc = options.userPrompt!.trim();

    const prompt = PROMPTS.autoFitting(poseDesc, options.autoFittingStylePrompt);
    historyParams.autoFittingPose = poseDesc;
    if (options.autoFittingStylePrompt) {
      historyParams.stylePrompt = options.autoFittingStylePrompt;
    }

    return { prompt, images: [], historyParams };
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
