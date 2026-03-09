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
  refundGenerationLog,
} from "@/lib/generation-log";

const ALLOWED_IMAGE_HOSTS = [
  "itdnavotqsdimdwbudbw.supabase.co",
  "kulxfkwgkdhsxwsurjpf.supabase.co",
];

const imageToVideoSchema = z.object({
  imageUrl: z
    .string()
    .url("유효한 이미지 URL이 필요합니다.")
    .refine(
      (url) => {
        try {
          const host = new URL(url).hostname;
          return ALLOWED_IMAGE_HOSTS.includes(host);
        } catch {
          return false;
        }
      },
      { message: "허용되지 않는 이미지 URL입니다." },
    ),
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

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "비디오 생성은 로그인이 필요합니다.", code: "LOGIN_REQUIRED" },
        { status: 401 },
      );
    }

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

    // 토큰 선차감 (race condition 방지: 먼저 차감 → 실패 시 환불)
    const supabase = createServiceClient();
    const { error: spendError } = await supabase.rpc("spend_tokens", {
      p_user_id: userId,
      p_amount: cost,
      p_description: `이미지 비디오 생성 (${duration}초)`,
    });

    if (spendError) {
      if (spendError.message?.includes("TOKEN_INSUFFICIENT")) {
        throw new TokenInsufficientError();
      }
      console.error("Token spend error:", spendError);
      return NextResponse.json(
        { success: false, error: "토큰 차감 중 오류가 발생했습니다.", code: "VIDEO_003" },
        { status: 500 },
      );
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

    await updateGenerationLog(logId, {
      status: "tokens_spent",
      tokensCharged: cost,
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
      // API 실패 → 즉시 환불
      await supabase.rpc("refund_tokens", {
        p_user_id: userId,
        p_amount: cost,
        p_description: `비디오 생성 실패 환불 (${duration}초)`,
        p_reference_id: logId,
      });

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

    // 성공 시 task_id 기록
    await updateGenerationLog(logId, {
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

    // 토큰 선차감 후 예외 발생 시 환불
    if (logId) {
      await refundGenerationLog(logId);
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
