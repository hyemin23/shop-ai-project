import { processImageFile } from "@/lib/image-utils";
import { PROMPTS } from "@/config/prompts";
import type {
  StudioTypeProcessor,
  ProcessOptions,
  PromptBuildResult,
} from "../types";

const GARMENT_TYPE_MAP: Record<string, string> = {
  auto: "clothing",
  top: "upper body clothing (top/shirt/jacket)",
  bottom: "lower body clothing (pants/skirt)",
  dress: "dress/one-piece",
};

export class ColorSwapProcessor implements StudioTypeProcessor {
  validate(options: ProcessOptions): void {
    if (!options.referenceFile && !options.targetColor) {
      throw new ValidationError("목표 색상이 필요합니다.");
    }
  }

  async buildPromptAndImages(options: ProcessOptions): Promise<PromptBuildResult> {
    const images = [];
    const historyParams: Record<string, unknown> = {};
    const region = options.garmentRegion || "auto";
    const garmentLabel = GARMENT_TYPE_MAP[region] || "clothing";
    let prompt: string;

    if (options.referenceFile) {
      const refProcessed = await processImageFile(options.referenceFile);
      images.push({
        base64: refProcessed.base64,
        mimeType: refProcessed.mimeType,
      });
      prompt = PROMPTS.colorSwapFromReference(garmentLabel, options.userPrompt);
      historyParams.colorMode = "reference";
      historyParams.colorReferenceImage = "uploaded";
    } else {
      prompt = PROMPTS.colorSwap(
        options.targetColor!,
        garmentLabel,
        options.userPrompt,
      );
      historyParams.targetColor = options.targetColor;
      historyParams.colorMode = "hex";
    }

    historyParams.garmentRegion = region;

    return { prompt, images, historyParams };
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
