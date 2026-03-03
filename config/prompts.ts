import { type GenerationMode, type GeminiModel } from "@/types/studio";
import { PROMPT_CONSTRAINTS } from "@/config/studio";

export const GEMINI_MODELS: Record<GenerationMode, GeminiModel> = {
  standard: "gemini-2.5-flash-image",
  premium: "gemini-3-pro-image-preview",
};

const WATERMARK_INSTRUCTION =
  "If the source image contains any watermarks, logos, or text overlays, remove them completely in the output so the result is clean.";

function appendUserPrompt(basePrompt: string, userPrompt?: string): string {
  if (!userPrompt?.trim()) return basePrompt;
  return `${basePrompt}\n\nAdditional user instructions: ${userPrompt.trim().slice(0, PROMPT_CONSTRAINTS.maxLength)}`;
}

export const PROMPTS = {
  tryOn: (context?: string, userPrompt?: string) =>
    appendUserPrompt(
      `You are a fashion image editing AI. Replace the clothing on the model in the source image with the clothing from the reference image. Keep the model's face, body shape, skin tone, and background exactly the same. Only change the clothing. The result should look like a natural photograph, not AI-generated. ${WATERMARK_INSTRUCTION}${context ? ` Additional context: ${context}` : ""}`,
      userPrompt,
    ),

  colorSwap: (hexColor: string, garmentType: string, userPrompt?: string) =>
    appendUserPrompt(
      `You are a fashion image editing AI. Change the color of the ${garmentType} in the image to ${hexColor}. Keep the texture, pattern, folds, and shadows of the fabric realistic. Do not change anything else in the image — the model, background, and other clothing items must remain exactly the same. ${WATERMARK_INSTRUCTION}`,
      userPrompt,
    ),

  poseTransfer: (poseDescription: string, userPrompt?: string) =>
    appendUserPrompt(
      `You are a fashion image editing AI. Change the model's pose to: ${poseDescription}. Keep the same clothing, face, body proportions, and background. The clothing should drape and fold naturally for the new pose. The result should look like a natural photograph. ${WATERMARK_INSTRUCTION}`,
      userPrompt,
    ),
};
