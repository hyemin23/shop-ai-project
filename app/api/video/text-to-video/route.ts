import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getUserOrSessionId } from "@/lib/auth";
import { createTextToVideoTask } from "@/lib/kling";
import { VIDEO_CREDIT_COST } from "@/config/pricing";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { TokenInsufficientError } from "@/lib/tokens";
import {
  createGenerationLog,
  updateGenerationLog,
} from "@/lib/generation-log";

const textToVideoSchema = z.object({
  prompt: z.string().min(1, "프롬프트를 입력해주세요.").max(2500),
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
});

export async function POST(request: NextRequest) {
  let logId: string | null = null;

  try {
    const { userId, sessionId } = await getUserOrSessionId();
    const body = await request.json();
    const parsed = textToVideoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { prompt, negativePrompt, model, aspectRatio, duration, mode } =
      parsed.data;

    const cost = VIDEO_CREDIT_COST[duration] ?? 10;

    // Token balance check (차감은 API 성공 후)
    if (userId) {
      const supabase = await createClient();
      const { data: balance } = await supabase
        .from("token_balances")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (!balance || balance.balance < cost) {
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
      action: "text-to-video",
      params: { prompt, negativePrompt, model, aspectRatio, duration, mode },
    });

    // Kling API 호출
    const response = await createTextToVideoTask({
      model_name: model,
      prompt,
      negative_prompt: negativePrompt,
      mode,
      aspect_ratio: aspectRatio,
      duration,
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
        p_description: `텍스트 비디오 생성 (${duration}초)`,
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

    console.error("Text-to-video error:", error);
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
