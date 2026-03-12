import { processImageFile } from "@/lib/image-utils";
import { PROMPTS } from "@/config/prompts";
import type {
  StudioTypeProcessor,
  ProcessOptions,
  PromptBuildResult,
} from "../types";

export class BackgroundSwapProcessor implements StudioTypeProcessor {
  validate(options: ProcessOptions): void {
    if (!options.referenceFile) {
      throw new ValidationError("배경 이미지가 필요합니다.");
    }
  }

  async buildPromptAndImages(options: ProcessOptions): Promise<PromptBuildResult> {
    const images = [];
    const historyParams: Record<string, unknown> = {};

    const bgRefProcessed = await processImageFile(options.referenceFile!);
    images.push({
      base64: bgRefProcessed.base64,
      mimeType: bgRefProcessed.mimeType,
    });

    const prompt = PROMPTS.backgroundSwap(options.userPrompt);
    historyParams.backgroundReferenceImage = "uploaded";

    return { prompt, images, historyParams };
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
