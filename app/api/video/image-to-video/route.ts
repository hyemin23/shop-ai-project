import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getUserOrSessionId, checkBetaUser } from "@/lib/auth";
import { createImageToVideoTask } from "@/lib/kling";
import { VIDEO_CREDIT_COST } from "@/config/pricing";
import { createServiceClient } from "@/lib/supabase/server";
import { TokenInsufficientError } from "@/lib/tokens";
import {
  createGenerationLog,
  updateGenerationLog,
} from "@/lib/generation-log";

const imageToVideoSchema = z.object({
  imageUrl: z.string().url("유효한 이미지 URL이 필요합니다."),
  prompt: z.string().max(2500).optional(),
  negativePrompt: z.string().max(2500).optional(),
  model: z.enum([
    "kling-v1",
    "kling-v1-6",
    "kling-v2-master",
    "kling-v2-1-master",
    "kling-v2-5-turbo",
    "kling-v2-6",
  ]),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]),
  duration: z.enum(["5", "10"]),
  mode: z.enum(["std", "pro"]),
  cfg_scale: z.number().min(0).max(1).default(0.5),
  motionStrength: z.number().min(0).max(1).default(0.5),
  cameraMovement: z
    .enum([
      "static",
      "zoom-in",
      "zoom-out",
      "pan-left",
      "pan-right",
      "pan-up",
      "pan-down",
    ])
    .default("static"),
  fps: z.union([z.literal(24), z.literal(30)]).default(24),
  resolution: z.enum(["1080p", "4K"]).default("4K"),
  lighting: z
    .enum(["natural", "studio", "dramatic", "warm", "cool"])
    .default("natural"),
  colorGrading: z
    .enum(["none", "cinematic", "vintage", "cold", "warm"])
    .default("none"),
  style: z
    .enum(["photorealistic", "cinematic", "anime", "3d-animation"])
    .default("photorealistic"),
  sound: z.enum(["off", "on"]).default("off"),
});

export async function POST(request: NextRequest) {
  let logId: string | null = null;

  try {
    const { userId, sessionId } = await getUserOrSessionId();

    if (await checkBetaUser(userId)) {
      return NextResponse.json(
        { success: false, error: "베타 테스터는 비디오 기능을 이용할 수 없습니다.", code: "BETA_VIDEO_BLOCKED" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = imageToVideoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const {
      imageUrl,
      prompt,
      negativePrompt,
      model,
      aspectRatio,
      duration,
      mode,
      cfg_scale,
      motionStrength,
      cameraMovement,
      fps,
      resolution,
      lighting,
      colorGrading,
      style,
      sound,
    } = parsed.data;

    const cost = VIDEO_CREDIT_COST[duration] ?? 10;

    // Token balance check (차감은 API 성공 후)
    if (userId) {
      const supabase = createServiceClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("token_balance")
        .eq("id", userId)
        .single();

      if (!profile || (profile.token_balance ?? 0) < cost) {
        return NextResponse.json(
          {
            success: false,
            error: "토큰이 부족합니다. 토큰을 충전해주세요.",
            code: "TOKEN_INSUFFICIENT",
          },
          { status: 402 },
        );
      }
    }

    // Generation log 생성
    logId = await createGenerationLog({
      userId,
      sessionId,
      serviceType: "video",
      action: "image-to-video",
      params: {
        imageUrl,
        prompt,
        negativePrompt,
        model,
        aspectRatio,
        duration,
        mode,
        cfg_scale,
        motionStrength,
        cameraMovement,
        fps,
        resolution,
        lighting,
        colorGrading,
        style,
        sound,
      },
    });

    // Kling API 호출 (Supabase public URL을 직접 전달)
    const response = await createImageToVideoTask({
      model_name: model,
      image: imageUrl,
      prompt: prompt || undefined,
      negative_prompt: negativePrompt || undefined,
      mode,
      aspect_ratio: aspectRatio,
      duration,
      cfg_scale,
    });

    if (response.code !== 0) {
      await updateGenerationLog(logId, {
        status: "failed",
        errorCode: "VIDEO_001",
        errorMessage: response.message || "비디오 생성 요청이 실패했습니다.",
      });

      return NextResponse.json(
        {
          success: false,
          error: response.message || "비디오 생성 요청이 실패했습니다.",
          code: "VIDEO_001",
        },
        { status: 500 },
      );
    }

    // API 성공 후 토큰 차감
    if (userId) {
      const serviceClient = createServiceClient();
      const { error: spendError } = await serviceClient.rpc("spend_tokens", {
        p_user_id: userId,
        p_amount: cost,
        p_description: `이미지 비디오 생성 (${duration}초)`,
        p_reference_id: response.data.task_id,
      });

      if (spendError) {
        if (spendError.message?.includes("TOKEN_INSUFFICIENT")) {
          await updateGenerationLog(logId, {
            status: "failed",
            errorCode: "TOKEN_INSUFFICIENT",
            errorMessage: "토큰 차감 실패",
            externalTaskId: response.data.task_id,
          });
          throw new TokenInsufficientError();
        }
        console.error("Token spend error:", spendError);
      }
    }

    await updateGenerationLog(logId, {
      status: "tokens_spent",
      tokensCharged: userId ? cost : 0,
      externalTaskId: response.data.task_id,
    });

    return NextResponse.json({
      success: true,
      taskId: response.data.task_id,
      status: response.data.task_status,
      logId,
    });
  } catch (error) {
    if (error instanceof TokenInsufficientError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: "TOKEN_INSUFFICIENT",
        },
        { status: 402 },
      );
    }

    await updateGenerationLog(logId, {
      status: "failed",
      errorCode: "VIDEO_003",
      errorMessage:
        error instanceof Error
          ? error.message
          : "비디오 생성 중 오류가 발생했습니다.",
    });

    console.error("Image-to-video error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "비디오 생성 중 오류가 발생했습니다.",
        code: "VIDEO_003",
      },
      { status: 500 },
    );
  }
}
