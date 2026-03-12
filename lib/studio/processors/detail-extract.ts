import { PROMPTS } from "@/config/prompts";
import { DETAIL_PRESETS, DEFAULT_4SPLIT_PRESETS } from "@/types/detail-extract";
import type {
  StudioTypeProcessor,
  ProcessOptions,
  PromptBuildResult,
} from "../types";

export class DetailExtractProcessor implements StudioTypeProcessor {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(_options: ProcessOptions): void {
    // detail-extract has no strict validation requirements
  }

  async buildPromptAndImages(options: ProcessOptions): Promise<PromptBuildResult> {
    const historyParams: Record<string, unknown> = {};
    const extractionMode = options.extractionMode || "rose-cut";
    let prompt: string;

    if (extractionMode === "rose-cut") {
      prompt = PROMPTS.roseCut(options.userPrompt);
    } else if (extractionMode === "nukki") {
      prompt = PROMPTS.nukkiCut(options.userPrompt);
    } else {
      const details =
        options.detailPresets ||
        DEFAULT_4SPLIT_PRESETS.map(
          (id) => DETAIL_PRESETS.find((p) => p.id === id)!.description,
        );
      prompt = PROMPTS.fourSplitCut(details, options.userPrompt);
    }

    historyParams.extractionMode = extractionMode;
    if (options.detailPresets)
      historyParams.detailPresets = options.detailPresets;

    return { prompt, images: [], historyParams };
  }
}
