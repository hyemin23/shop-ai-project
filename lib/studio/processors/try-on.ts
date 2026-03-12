import { processImageFile } from "@/lib/image-utils";
import { PROMPTS } from "@/config/prompts";
import type {
  StudioTypeProcessor,
  ProcessOptions,
  PromptBuildResult,
} from "../types";

export class TryOnProcessor implements StudioTypeProcessor {
  validate(options: ProcessOptions): void {
    if (!options.referenceFile) {
      throw new ValidationError("참조 이미지가 필요합니다.");
    }
  }

  async buildPromptAndImages(options: ProcessOptions): Promise<PromptBuildResult> {
    const images = [];
    const historyParams: Record<string, unknown> = {};

    const refProcessed = await processImageFile(options.referenceFile!);
    images.push({
      base64: refProcessed.base64,
      mimeType: refProcessed.mimeType,
    });

    const prompt = PROMPTS.tryOn(
      options.garmentCategory || undefined,
      options.userPrompt,
    );
    historyParams.referenceImage = "uploaded";

    return { prompt, images, historyParams };
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
