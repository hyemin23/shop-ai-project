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
      `You are a professional fashion image editing AI. Your task is to replace the clothing on the model in the first image with the clothing shown in the second image.

Step 1: Analyze the model — memorize the face, hairstyle, skin tone, body proportions, pose, and background with pixel-perfect detail.
Step 2: Analyze the reference garment — capture its design, color, pattern, texture, neckline, sleeves, and overall silhouette.
Step 3: Remove the original clothing from the model while preserving the body shape and pose.
Step 4: Dress the model in the reference garment, adapting it naturally to the model's body proportions and current pose.
Step 5: Ensure the garment drapes, folds, and wrinkles realistically based on the pose and body shape, with proper shadows and highlights.

Critical constraints:
- Face, hairstyle, skin tone, body proportions, and background must remain unchanged.
- Only the clothing should change — do not alter accessories unless they conflict with the new garment.
- The final result must look like a natural photograph, not AI-generated.
${WATERMARK_INSTRUCTION}${context ? ` Additional context: ${context}` : ""}`,
      userPrompt,
    ),

  colorSwap: (hexColor: string, garmentType: string, userPrompt?: string) =>
    appendUserPrompt(
      `You are a professional fashion image editing AI. Your task is to change the color of the ${garmentType} in the image to ${hexColor}.

Step 1: Identify the ${garmentType} region precisely, distinguishing it from skin, hair, background, and other clothing items.
Step 2: Apply ${hexColor} uniformly across the entire garment area.
Step 3: Preserve the original fabric texture, weave pattern, and any printed designs — only the base color should change.
Step 4: Adjust shadows, highlights, and folds naturally so the new color looks realistic under the existing lighting conditions.

Critical constraints:
- Do not modify anything outside the ${garmentType} — face, skin, hair, background, and other clothing must remain identical.
- Do not flatten or remove fabric texture, wrinkles, or fold details.
- The final result must look like the garment was originally manufactured in the target color.
${WATERMARK_INSTRUCTION}`,
      userPrompt,
    ),

  poseTransfer: (poseDescription: string, userPrompt?: string) =>
    appendUserPrompt(
      `You are a professional fashion image editing AI. Your task is to change the model's pose to: ${poseDescription}

Step 1: Analyze the model — memorize the face, hairstyle, skin tone, body proportions, clothing details (color, texture, pattern, accessories), and background.
Step 2: Repose the model's body to match the target pose while maintaining the exact same face identity and body proportions.
Step 3: Adapt the clothing to the new pose — ensure sleeves, collars, hemlines, and fabric panels drape, stretch, and fold naturally for the new body position.
Step 4: Maintain the original background and ensure the model's placement, ground contact, and shadow remain consistent with the new pose.

Critical constraints:
- Face, hairstyle, skin tone, and body proportions must remain identical — only the pose changes.
- The clothing must remain the same garment with the same color, pattern, and texture — adapt it to the new pose, do not replace it.
- The final result must look like a natural photograph taken in the new pose.
${WATERMARK_INSTRUCTION}`,
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
