import { PROMPTS } from "@/config/prompts";
import type {
  StudioTypeProcessor,
  ProcessOptions,
  PromptBuildResult,
} from "../types";

export class UgcProcessor implements StudioTypeProcessor {
  validate(options: ProcessOptions): void {
    if (!options.ugcSceneDescription) {
      throw new ValidationError("장면 설명이 필요합니다.");
    }
  }

  async buildPromptAndImages(options: ProcessOptions): Promise<PromptBuildResult> {
    const historyParams: Record<string, unknown> = {};

    const prompt = PROMPTS.ugcGenerate(
      options.ugcGender || "female",
      options.ugcAgeGroup || "20s",
      options.ugcSceneDescription!,
      options.userPrompt,
    );
    historyParams.ugcGender = options.ugcGender;
    historyParams.ugcAgeGroup = options.ugcAgeGroup;
    historyParams.ugcScene = options.ugcSceneDescription;

    return { prompt, images: [], historyParams };
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
