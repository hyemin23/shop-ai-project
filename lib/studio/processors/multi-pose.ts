import { PROMPTS } from "@/config/prompts";
import type {
  StudioTypeProcessor,
  ProcessOptions,
  PromptBuildResult,
} from "../types";

export class MultiPoseProcessor implements StudioTypeProcessor {
  validate(options: ProcessOptions): void {
    if (!options.userPrompt?.trim()) {
      throw new ValidationError("포즈 설명이 필요합니다.");
    }
  }

  async buildPromptAndImages(options: ProcessOptions): Promise<PromptBuildResult> {
    const historyParams: Record<string, unknown> = {};
    const prompt = PROMPTS.poseTransfer(options.userPrompt!.trim());
    historyParams.poseDescription = options.userPrompt!.trim();

    return { prompt, images: [], historyParams };
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
