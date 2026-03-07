import { GoogleGenAI } from "@google/genai";
import * as Sentry from "@sentry/nextjs";
import { GEMINI_MODELS } from "@/config/prompts";
import { StudioError } from "@/lib/errors";
import {
  type GenerationMode,
  type GeminiModel,
  type ImageGenerationOptions,
} from "@/types/studio";

const FLASH_2_5: GeminiModel = "gemini-2.5-flash-image";

const defaultAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function getAiClient(apiKey?: string): GoogleGenAI {
  if (apiKey) {
    return new GoogleGenAI({ apiKey });
  }
  return defaultAi;
}

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
  imageOptions?: ImageGenerationOptions,
  modelOverride?: GeminiModel,
  betaApiKey?: string,
): Promise<GeminiImageResult> {
  const modelId = modelOverride ?? GEMINI_MODELS[mode];
  let fallbackUsed = false;

  const aiClient = getAiClient(betaApiKey);

  try {
    return await callModel(aiClient, modelId, prompt, images, fallbackUsed, imageOptions);
  } catch (error) {
    if (mode === "premium" && isOverloadOrRateLimit(error)) {
      fallbackUsed = true;
      try {
        return await callModel(
          aiClient,
          GEMINI_MODELS.standard,
          prompt,
          images,
          fallbackUsed,
          imageOptions,
        );
      } catch {
        throw new StudioError("STUDIO_006");
      }
    }

    const status = (error as { status?: number })?.status;
    const errMsg = (error as Error)?.message ?? "unknown";
    console.error(`[Gemini] API error | model=${modelId} mode=${mode} status=${status} | ${errMsg}`);

    Sentry.captureException(error, {
      tags: { service: "gemini", mode, model: modelId },
    });

    if (status === 429) {
      throw new StudioError("STUDIO_005");
    }

    throw new StudioError("STUDIO_006");
  }
}

async function callModel(
  aiClient: GoogleGenAI,
  modelId: string,
  prompt: string,
  images: { base64: string; mimeType: string }[],
  fallbackUsed: boolean,
  imageOptions?: ImageGenerationOptions,
): Promise<GeminiImageResult> {
  const config: Record<string, unknown> = {
    responseModalities: ["IMAGE", "TEXT"],
  };

  const imageConfig: Record<string, unknown> = {};
  if (imageOptions?.aspectRatio) {
    imageConfig.aspectRatio = imageOptions.aspectRatio;
  }
  // gemini-2.5-flash-image는 imageSize 파라미터 미지원 (1024px 고정)
  if (imageOptions?.imageSize && modelId !== FLASH_2_5) {
    imageConfig.imageSize = imageOptions.imageSize;
  }
  if (Object.keys(imageConfig).length > 0) {
    config.imageConfig = imageConfig;
  }

  const contents = [
    ...images.map((img) => ({
      inlineData: { mimeType: img.mimeType, data: img.base64 },
    })),
    { text: prompt },
  ];

  console.log(`[Gemini] Request | model=${modelId} images=${images.length} config=${JSON.stringify(config.imageConfig ?? {})}`);

  const response = await aiClient.models.generateContent({
    model: modelId,
    contents,
    config,
  });

  const candidate = response.candidates?.[0];
  const parts = candidate?.content?.parts;
  const finishReason = candidate?.finishReason;
  const blockReason = response.promptFeedback?.blockReason;

  if (!parts) {
    console.error(`[Gemini] No parts | finishReason=${finishReason} blockReason=${blockReason} response=${JSON.stringify(response.candidates?.[0] ?? {}).slice(0, 500)}`);
    throw new StudioError("STUDIO_006");
  }

  const imagePart = parts.find(
    (part) => "inlineData" in part && part.inlineData,
  );

  if (!imagePart || !("inlineData" in imagePart) || !imagePart.inlineData) {
    const textParts = parts.filter((p) => "text" in p).map((p) => ("text" in p ? p.text : "")).join(" ");
    console.error(`[Gemini] No image in response | finishReason=${finishReason} textParts="${textParts.slice(0, 300)}"`);
    throw new StudioError("STUDIO_003");
  }

  return {
    imageBase64: imagePart.inlineData.data as string,
    mimeType: imagePart.inlineData.mimeType || "image/png",
    modelUsed: modelId,
    fallbackUsed,
  };
}
