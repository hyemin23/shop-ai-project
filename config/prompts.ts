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

  colorSwapFromReference: (garmentType: string, userPrompt?: string) =>
    appendUserPrompt(
      `You are a professional fashion image editing AI. Your task is to change the color of the ${garmentType} in the first image to match the dominant garment/fabric color shown in the second reference image.

Step 1: Analyze the second (reference) image — identify its dominant garment or fabric color precisely, including shade, saturation, and tone.
Step 2: Identify the ${garmentType} region in the first image precisely, distinguishing it from skin, hair, background, and other clothing items.
Step 3: Apply the extracted reference color uniformly across the entire garment area in the first image.
Step 4: Preserve the original fabric texture, weave pattern, and any printed designs — only the base color should change.
Step 5: Adjust shadows, highlights, and folds naturally so the new color looks realistic under the existing lighting conditions.

Critical constraints:
- Do not modify anything outside the ${garmentType} — face, skin, hair, background, and other clothing must remain identical.
- Do not flatten or remove fabric texture, wrinkles, or fold details.
- The final result must look like the garment was originally manufactured in the reference color.
${WATERMARK_INSTRUCTION}`,
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

  roseCut: (userPrompt?: string) =>
    appendUserPrompt(
      `You are a professional fashion product photographer specializing in fabric macro photography. Create an extreme close-up shot of the fabric from the clothing in the provided image, as if photographed with a macro lens at very close range.

Step 1: Identify the primary fabric — analyze its weave pattern, thread structure, color, and surface characteristics.
Step 2: Crop into the fabric at extreme magnification, showing only the fabric surface filling the entire frame. Imagine placing a macro lens directly on the fabric.
Step 3: Capture the natural drape and soft folds of the fabric — show gentle creases and undulations that reveal how the material falls and moves, similar to a fabric swatch laid on a surface.
Step 4: Use soft, even studio lighting that reveals the 3D surface texture — every individual thread, weave intersection, and fiber should be clearly visible.
Step 5: The final image should look like a professional fabric swatch photograph taken for a textile catalog — clean, detailed, and tactile.

Critical constraints:
- Generate ONE image: an extreme macro close-up filling the entire frame with fabric texture.
- Show the fabric with natural soft folds and draping — NOT flat, NOT twisted, NOT shaped into any pattern or spiral.
- Do NOT include any model, body, face, garment silhouette, or background — only the fabric surface.
- Do NOT create any artistic shapes, swirls, spirals, or compositions — just a straight, clean macro shot of the fabric.
- Preserve original colors and patterns exactly as they appear.
- The result must look like a real photograph taken with a macro lens, not AI-generated art.
${WATERMARK_INSTRUCTION}`,
      userPrompt,
    ),

  autoFitting: (poseDescription: string, stylePrompt?: string) =>
    appendUserPrompt(
      `You are a professional fashion image editing AI. Your task is to change the model's pose to create a full-body 1:1 fitting shot.

Target pose: ${poseDescription}

Step 1: Analyze the model — memorize the face, hairstyle, skin tone, body proportions, clothing details (color, texture, pattern, accessories), and background.
Step 2: Repose the model's body to match the target pose exactly, ensuring a full-body 1:1 composition where the entire body from head to toe is visible.
Step 3: Adapt the clothing to the new pose — ensure sleeves, collars, hemlines, and fabric panels drape, stretch, and fold naturally for the new body position.
Step 4: Maintain the original background and ensure the model's placement, ground contact, and shadow remain consistent with the new pose.
Step 5: Ensure the output is a clean, professional full-body shot suitable for e-commerce product listings.

Critical constraints:
- Face, hairstyle, skin tone, and body proportions must remain identical — only the pose changes.
- The clothing must remain the same garment with the same color, pattern, and texture — adapt it to the new pose, do not replace it.
- The output must be a full-body 1:1 shot showing the entire body from head to toe.
- The final result must look like a natural photograph taken in the new pose.
${WATERMARK_INSTRUCTION}`,
      stylePrompt,
    ),

  fourSplitCut: (details: string[], userPrompt?: string) =>
    appendUserPrompt(
      `You are a professional fashion product photographer. Create a "4-split detail" composition — a single image divided into 4 equal quadrants arranged in a 2×2 grid, each showing a high-resolution close-up of a specific garment detail from the provided image.

Step 1: Analyze the garment comprehensively.
Step 2: Generate exactly 4 close-up quadrants:
  - Top-left: ${details[0]}
  - Top-right: ${details[1]}
  - Bottom-left: ${details[2]}
  - Bottom-right: ${details[3]}
Step 3: Each quadrant must be a sharp, high-magnification close-up that clearly shows fine details like texture, stitching, and construction quality.
Step 4: Use consistent lighting and color temperature across all 4 quadrants.
Step 5: Arrange them in a clean 2×2 grid with thin white dividing lines between quadrants.

Critical constraints:
- Generate ONE image containing 4 quadrants in a 2×2 grid layout.
- Do NOT include any model body, face, or background in any quadrant.
- Each quadrant must focus on a different detail area.
- All quadrant colors must match the original garment.
- The result must look like professional product detail photography.
${WATERMARK_INSTRUCTION}`,
      userPrompt,
    ),
};
