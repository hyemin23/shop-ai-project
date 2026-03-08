import { type GenerationMode, type GeminiModel } from "@/types/studio";
import { PROMPT_CONSTRAINTS } from "@/config/studio";

export const GEMINI_MODELS: Record<GenerationMode, GeminiModel> = {
  standard: "gemini-3.1-flash-image-preview",
  premium: "gemini-3-pro-image-preview",
};

const WATERMARK_INSTRUCTION =
  "If the source image contains any watermarks, logos, or text overlays, remove them completely in the output so the result is clean.";

const FACELESS_CROP_INSTRUCTION = `
FACELESS FRAMING (MANDATORY):
- Frame the shot as if taken from a slightly farther distance — show the full body with natural headroom above the model.
- Include the model's head silhouette and hair, but crop so the face is NOT recognizable: cut off at approximately the nose or mouth level. The forehead, eyes, and nose bridge should NOT be visible.
- There should be comfortable empty space (about 10-15% of frame height) above the top of the head, like a real full-body fashion photograph.
- Show the entire outfit from shoulders to shoes with natural proportions — do NOT compress or crop the body tightly.
- Keep the original background, lighting, and composition.
- Do NOT blur, pixelate, or mask the face — simply frame it out of view naturally.`;

function appendUserPrompt(basePrompt: string, userPrompt?: string): string {
  if (!userPrompt?.trim()) return basePrompt;
  return `${basePrompt}\n\nAdditional user instructions: ${userPrompt.trim().slice(0, PROMPT_CONSTRAINTS.maxLength)}`;
}

export const PROMPTS = {
  tryOn: (garmentCategory?: string, userPrompt?: string) => {
    const CATEGORY_LABELS: Record<string, string> = {
      top: "upper-body garment (shirt, blouse, knit, hoodie, sweatshirt)",
      bottom: "lower-body garment (pants, skirt, shorts)",
      outerwear: "outer layer (jacket, coat, cardigan, blazer)",
      "one-piece": "full-body garment (dress, jumpsuit, overall)",
    };
    const category = garmentCategory && CATEGORY_LABELS[garmentCategory]
      ? garmentCategory
      : undefined;
    const categoryLabel = category ? CATEGORY_LABELS[category] : undefined;

    return appendUserPrompt(
      `You are a garment-swap engine. Replace ONE garment on the model (image 1) with the reference garment (image 2). Output a single photo-realistic image.

STEP 0 — EXTRACT GARMENT FROM REFERENCE (image 2):
The reference image may show a model wearing it, a flat-lay, a product photo, or a close-up.
${category
  ? `The target garment is PRE-CLASSIFIED as: "${category}" (${categoryLabel}).
Look at image 2 and extract ONLY the ${categoryLabel} — COMPLETELY IGNORE any other clothing visible in image 2 (pants, skirts, shoes, accessories, etc.). They are NOT part of the swap.`
  : `Classify the reference garment as: top / bottom / outerwear / one-piece.
Extract ONLY that garment from image 2 — ignore everything else.`}
Focus on: silhouette, color, pattern, texture, neckline, sleeve length, hem shape.

SILHOUETTE FIDELITY: Reproduce the garment's fit EXACTLY as shown in image 2:
- If oversized/loose → output must be equally loose on the model
- If slim/fitted → output must be equally fitted
- Hem position (crop/hip/knee/ankle) must match image 2 precisely
- Sleeve length must match image 2 precisely
- Do NOT normalize any garment to "regular fit"

STEP 1 — SWAP: On image 1, replace ONLY the ${category ?? "classified"} garment with the extracted garment. Adapt fit, draping, and wrinkles to the model's exact pose and body.

STEP 2 — OUTPUT the FULL original image with the swap applied — same resolution, same crop, same framing as image 1.

PRESERVE (copy unchanged from image 1):
• Full image frame, crop, canvas size
• Face, hair, skin tone, hands, body proportions, pose
• Background, floor, wall, lighting, shadows
• ALL accessories — if absent in image 1, absent in output
• Shoes and footwear
• Garment silhouette volume (oversized stays oversized, slim stays slim)
• Garment hem position relative to body
• Sleeve length and cuff style
• Every garment OUTSIDE the swap category must stay PIXEL-IDENTICAL:
${category === "top" ? "  → You are swapping the TOP only. The pants/skirt, shoes, and all other items must remain exactly as in image 1. Do NOT copy pants from image 2."
  : category === "bottom" ? "  → You are swapping the BOTTOM only. The top/jacket, shoes, and all other items must remain exactly as in image 1."
  : category === "outerwear" ? "  → You are swapping the OUTERWEAR only. The inner top, bottom, shoes must remain exactly as in image 1."
  : "  → top swap: pants/skirt identical | bottom swap: top identical | outerwear swap: inner + bottom identical"}

FORBIDDEN:
• Cropping, zooming, or reframing the image
• Changing color/style of ANY non-target clothing
• Transferring ANY clothing from image 2 other than the target garment (e.g. do NOT copy pants/shoes/accessories from the reference image)
• Adding or removing ANY accessory
• Normalizing garment fit — if reference is oversized, output MUST be oversized
• Changing garment length (crop↔long)
• Blending the reference image's model body, face, pose, or background into the output
${WATERMARK_INSTRUCTION}
${FACELESS_CROP_INSTRUCTION}`,
      userPrompt,
    );
  },

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
${WATERMARK_INSTRUCTION}
${FACELESS_CROP_INSTRUCTION}`,
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
${WATERMARK_INSTRUCTION}
${FACELESS_CROP_INSTRUCTION}`,
      userPrompt,
    ),

  poseTransfer: (poseDescription: string, userPrompt?: string) =>
    appendUserPrompt(
      `You are a professional fashion image editing AI. Your task is to change the model's pose to: ${poseDescription}

Step 1: Analyze the model — memorize the face, hairstyle, skin tone, body proportions, clothing details (color, texture, pattern, accessories), and background.
Step 2: Repose the model's body to match the target pose while maintaining the exact same face identity and body proportions.
Step 3: Adapt the clothing to the new pose — ensure sleeves, collars, hemlines, and fabric panels drape, stretch, and fold naturally for the new body position.
Step 4: Maintain the original background and ensure the model's placement, ground contact, and shadow remain consistent with the new pose.

MOVEMENT INTENSITY (MANDATORY):
- Keep ALL movements subtle and minimal — no exaggerated strides, wide leg spreads, or dramatic arm gestures.
- Walking poses: narrow stride only (feet no more than one shoe-length apart).
- Arm/hand poses: gentle, relaxed positioning — avoid theatrical or forced gestures.
- The overall impression should be calm and natural, as if the model is barely moving.

Critical constraints:
- Face, hairstyle, skin tone, and body proportions must remain identical — only the pose changes.
- The clothing must remain the same garment with the same color, pattern, and texture — adapt it to the new pose, do not replace it.
- The final result must look like a natural photograph taken in the new pose.
${WATERMARK_INSTRUCTION}
${FACELESS_CROP_INSTRUCTION}`,
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
${WATERMARK_INSTRUCTION}
${FACELESS_CROP_INSTRUCTION}`,
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
Step 2: Repose the model's body to match the target pose exactly, ensuring a full-body 1:1 composition where the entire outfit from shoulders to shoes is visible.
Step 3: Adapt the clothing to the new pose — ensure sleeves, collars, hemlines, and fabric panels drape, stretch, and fold naturally for the new body position.
Step 4: Maintain the original background and ensure the model's placement, ground contact, and shadow remain consistent with the new pose.
Step 5: Ensure the output is a clean, professional full-body shot suitable for e-commerce product listings.

MOVEMENT INTENSITY (MANDATORY):
- Keep ALL movements subtle and minimal — no exaggerated strides, wide leg spreads, or dramatic arm gestures.
- Walking poses: narrow stride only (feet no more than one shoe-length apart).
- Arm/hand poses: gentle, relaxed positioning — avoid theatrical or forced gestures.
- The overall impression should be calm and natural, as if the model is barely moving.

Critical constraints:
- Face, hairstyle, skin tone, and body proportions must remain identical — only the pose changes.
- The clothing must remain the same garment with the same color, pattern, and texture — adapt it to the new pose, do not replace it.
- The output must be a full-body 1:1 shot showing the entire outfit from shoulders to shoes.
- The final result must look like a natural photograph taken in the new pose.
${WATERMARK_INSTRUCTION}
${FACELESS_CROP_INSTRUCTION}`,
      stylePrompt,
    ),

  ugcGenerate: (gender: string, ageGroup: string, sceneDescription: string, userPrompt?: string) =>
    appendUserPrompt(
      `You are an AI creating hyper-realistic UGC style photos for social media.

INPUT: A clothing product image (first image).

TASK: Generate a photo of a Korean ${gender === "female" ? "woman" : "man"} in their ${ageGroup} wearing the exact clothing from the product image, in this scene:
${sceneDescription}

CRITICAL UGC AUTHENTICITY RULES:
1. CAMERA: Smartphone camera feel — slight depth-of-field, imperfect framing, realistic color processing
2. LIGHTING: Only natural scene lighting. No studio lights. Allow natural shadows, overexposed windows, warm indoor light
3. COMPOSITION: Selfie or friend's candid shot angle. NEVER professional photography
4. MODEL APPEARANCE (CRITICAL):
   - MUST be a Korean person with Korean idol-level visuals — attractive, well-groomed, stylish
   - Clear Korean facial features: monolid or subtle double eyelid, warm skin tone, black or dark brown hair
   - ${gender === "female" ? "Korean beauty standard: glass skin, subtle natural makeup, trendy Korean hairstyle (layered cut, see-through bangs, etc.)" : "Korean male beauty standard: clean-cut, well-styled hair, clear skin, sharp jawline"}
   - Natural relaxed expression (NOT stiff pose or stock-photo smile)
   - Age-appropriate styling for Korean ${ageGroup}
5. SETTING: All locations MUST be distinctly Korean — Korean signage, Korean interior design, Korean streetscape. No Western or ambiguous settings.
6. CLOTHING PRESERVATION (HIGHEST PRIORITY):
   - This is the MOST IMPORTANT rule. The clothing MUST be an exact replica of the input product image.
   - Preserve EXACT color (hue, saturation, brightness), pattern (stripes, checks, prints, logos, graphics), and fabric texture (knit, denim, silk, cotton, leather, etc.)
   - Maintain garment structure: neckline shape, sleeve length, button/zipper placement, pocket details, stitching lines, hem style
   - Show realistic fabric behavior: natural draping, gravity-based wrinkles, fold patterns consistent with the fabric weight and type
   - Do NOT alter, simplify, or reinterpret ANY design element of the clothing. Copy it pixel-perfectly.
   - If the product has text, logos, or graphic prints, reproduce them exactly as shown in the input image
7. SCENE: Natural interaction with environment. Consistent lighting/shadows between model and background
8. ANTI-AI: Avoid overly symmetrical face, plastic-smooth skin, oversaturated colors, perfect studio lighting, floating model, wrong finger count

The image must look indistinguishable from a real Korean Instagram/TikTok post by an attractive Korean influencer.
${WATERMARK_INSTRUCTION}`,
      userPrompt,
    ),

  nukkiCut: (userPrompt?: string) =>
    appendUserPrompt(
      `You are a professional e-commerce product photographer. Your task is to extract the clothing item from the provided image and present it as a clean product cut-out on a pure white background.

Step 1: Identify the clothing item precisely — separate it completely from the model, mannequin, hanger, background, and any props.
Step 2: Remove the background entirely and replace it with pure white (#FFFFFF).
Step 3: Position the clothing item front-facing, centered, filling 80–90% of the frame with equal margins on all sides.
Step 4: Maintain all original colors, textures, patterns, and construction details of the garment exactly.
Step 5: The final image must look like a professional product listing photo on white background.

Critical constraints:
- Background must be pure white (#FFFFFF) — no shadows, gradients, or reflections.
- Do NOT include any model body, face, skin, hands, or mannequin parts in the output.
- Do NOT add, remove, or alter any part of the garment itself.
- The result must be suitable for uploading to an e-commerce product detail section.
${WATERMARK_INSTRUCTION}`,
      userPrompt,
    ),

  fourSplitCut: (details: string[], userPrompt?: string) =>
    appendUserPrompt(
      `You are a professional fashion product photographer. Create a "4-split detail" composition — a single image divided into 4 equal quadrants arranged in a 2×2 grid, each showing a high-resolution close-up of a specific garment detail.

CRITICAL: You must extract and zoom into the ACTUAL garment in the provided photo. Do NOT imagine, hallucinate, or generate a different garment. Every detail must come directly from the EXACT clothing item shown in the input image.

Step 1: Carefully study the provided image — identify the garment type (hoodie, jacket, shirt, etc.), its structural features (hood, zipper, buttons, pockets, collar style), fabric, color, and all visible construction details. Memorize these features exactly.
Step 2: For each of the 4 detail areas below, mentally crop into the corresponding region of the ACTUAL garment in the photo and magnify it:
  - Top-left: ${details[0]}
  - Top-right: ${details[1]}
  - Bottom-left: ${details[2]}
  - Bottom-right: ${details[3]}
Step 3: Each quadrant must faithfully reproduce what is ACTUALLY visible in that area of the original garment — same fabric color, same texture, same construction. If the garment has a hood, the neckline/collar detail MUST show the hood. If it has a zipper, show the ACTUAL zipper.
Step 4: Use consistent soft studio lighting across all 4 quadrants.
Step 5: Arrange them in a clean 2×2 grid with thin white dividing lines between quadrants.

Critical constraints:
- Generate ONE image containing 4 quadrants in a 2×2 grid layout.
- NEVER alter the garment's structure — if it has a hood, show the hood; if it has snaps instead of buttons, show snaps. Be faithful to the original.
- NEVER substitute similar-looking details from a different garment. Each detail must be recognizable as belonging to the SAME item in the input photo.
- Do NOT include any model body, face, or background in any quadrant — only the garment detail.
- All colors, textures, and patterns must exactly match the original garment.
- The result must look like professional product detail photography.
${WATERMARK_INSTRUCTION}`,
      userPrompt,
    ),
};
