import { type GenerationMode, type GeminiModel } from "@/types/studio";
import { PROMPT_CONSTRAINTS } from "@/config/studio";

export const GEMINI_MODELS: Record<GenerationMode, GeminiModel> = {
  standard: "gemini-3.1-flash-image-preview",
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

  backgroundSwap: (userPrompt?: string) =>
    appendUserPrompt(
      `You are a professional photo compositor. Your task is to place the model from the first image onto the background from the second image.

Step 1: Extract the model (person and clothing) from the first image, preserving every detail — clothing texture, folds, hair, skin tone, accessories, and body proportions — with pixel-perfect fidelity.
Step 2: Remove the original background entirely.
Step 3: Place the model naturally into the background scene from the second image.
Step 4: Align perspective and scale so the model fits realistically in the new environment.
Step 5: Generate a natural ground shadow beneath the model's feet that matches the lighting direction of the new background.

Critical constraints:
- The model must remain completely unchanged — do not modify, relight, recolor, or retouch any part of the person or clothing.
- Only adjust the background to ensure seamless integration.
- The final result should look like a natural photograph taken in the new location.
${WATERMARK_INSTRUCTION}`,
      userPrompt,
    ),
};
