import { GoogleGenerativeAI } from "@google/generative-ai";
import * as Sentry from "@sentry/nextjs";
import { GEMINI_MODELS } from "@/config/prompts";
import { StudioError } from "@/lib/errors";
import { type GenerationMode } from "@/types/studio";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface GeminiImageResult {
  imageBase64: string;
  mimeType: string;
  modelUsed: string;
  fallbackUsed: boolean;
}

function isOverloadOrRateLimit(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  return status === 429 || status === 503 || status === 500;
}

export async function callGeminiWithImages(
  prompt: string,
  images: { base64: string; mimeType: string }[],
  mode: GenerationMode = "standard",
): Promise<GeminiImageResult> {
  const modelId = GEMINI_MODELS[mode];
  let fallbackUsed = false;

  try {
    return await callModel(modelId, prompt, images, fallbackUsed);
  } catch (error) {
    if (mode === "premium" && isOverloadOrRateLimit(error)) {
      fallbackUsed = true;
      try {
        return await callModel(
          GEMINI_MODELS.standard,
          prompt,
          images,
          fallbackUsed,
        );
      } catch {
        throw new StudioError("STUDIO_006");
      }
    }

    Sentry.captureException(error, {
      tags: { service: "gemini", mode, model: modelId },
    });

    if ((error as { status?: number })?.status === 429) {
      throw new StudioError("STUDIO_005");
    }

    throw new StudioError("STUDIO_006");
  }
}

async function callModel(
  modelId: string,
  prompt: string,
  images: { base64: string; mimeType: string }[],
  fallbackUsed: boolean,
): Promise<GeminiImageResult> {
  const model = genAI.getGenerativeModel({
    model: modelId,
    generationConfig: {
      responseModalities: ["image", "text"],
    } as Record<string, unknown>,
  });

  const imageParts = images.map((img) => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.base64,
    },
  }));

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = result.response;
  const parts = response.candidates?.[0]?.content?.parts;

  if (!parts) {
    throw new StudioError("STUDIO_006");
  }

  const imagePart = parts.find(
    (part) => "inlineData" in part && part.inlineData,
  );

  if (!imagePart || !("inlineData" in imagePart) || !imagePart.inlineData) {
    throw new StudioError("STUDIO_003");
  }

  return {
    imageBase64: imagePart.inlineData.data as string,
    mimeType: imagePart.inlineData.mimeType || "image/png",
    modelUsed: modelId,
    fallbackUsed,
  };
}
