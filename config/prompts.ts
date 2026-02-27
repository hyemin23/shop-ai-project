import { type GenerationMode } from "@/types/studio";

export const GEMINI_MODELS: Record<GenerationMode, string> = {
  standard: "gemini-2.5-flash-image",
  premium: "gemini-3-pro-image-preview",
};

export const PROMPTS = {
  tryOn: (context?: string) =>
    `You are a fashion image editing AI. Replace the clothing on the model in the source image with the clothing from the reference image. Keep the model's face, body shape, skin tone, and background exactly the same. Only change the clothing. The result should look like a natural photograph, not AI-generated.${context ? ` Additional context: ${context}` : ""}`,

  colorSwap: (hexColor: string, garmentType: string) =>
    `You are a fashion image editing AI. Change the color of the ${garmentType} in the image to ${hexColor}. Keep the texture, pattern, folds, and shadows of the fabric realistic. Do not change anything else in the image — the model, background, and other clothing items must remain exactly the same.`,

  poseTransfer: (poseDescription: string) =>
    `You are a fashion image editing AI. Change the model's pose to: ${poseDescription}. Keep the same clothing, face, body proportions, and background. The clothing should drape and fold naturally for the new pose. The result should look like a natural photograph.`,
} as const;
