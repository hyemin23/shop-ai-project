import { type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { processSingleStudioRequest } from "@/lib/studio-processor";
import { type AutoFittingSSEEvent } from "@/types/auto-fitting";
import { AUTO_FITTING_PRESETS } from "@/config/auto-fitting";
import { getTokenCost } from "@/lib/tokens";

export const maxDuration = 300;

const RATE_LIMIT_BASE_MS = 2000;

function jitteredDelay(): Promise<void> {
  const jitter = Math.random() * 1000;
  return new Promise((resolve) =>
    setTimeout(resolve, RATE_LIMIT_BASE_MS + jitter),
  );
}

export async function POST(request: NextRequest) {
  const { userId, sessionId } = await getUserOrSessionId();
  const formData = await request.formData();

  const sourceImage = formData.get("sourceImage") as File | null;
  const imageSize = (formData.get("imageSize") as string) || "1K";
  const stylePrompt = (formData.get("stylePrompt") as string)?.trim() || undefined;

  if (!sourceImage) {
    return new Response(
      JSON.stringify({ error: "소스 이미지가 필요합니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const presets = AUTO_FITTING_PRESETS;
  const totalItems = presets.length;

  // 토큰 사전 확인
  if (userId) {
    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("token_balance, is_master")
      .eq("id", userId)
      .single();

    if (profile && !profile.is_master) {
      const costPerItem = getTokenCost("auto-fitting", "standard");
      const totalCost = totalItems * costPerItem;

      if ((profile.token_balance ?? 0) < totalCost) {
        return new Response(
          JSON.stringify({
            error: "토큰이 부족합니다.",
            code: "TOKEN_INSUFFICIENT",
            required: totalCost,
            balance: profile.token_balance ?? 0,
          }),
          { status: 402, headers: { "Content-Type": "application/json" } },
        );
      }
    }
  }

  // batch_jobs 레코드 생성
  const supabase = createServiceClient();
  const { data: batchJob, error: batchError } = await supabase
    .from("batch_jobs")
    .insert({
      session_id: sessionId,
      user_id: userId,
      status: "processing",
      type: "auto-fitting",
      mode: "standard",
      total_items: totalItems,
      params: {
        presets: presets.map((p) => p.id),
        stylePrompt,
      },
    })
    .select("id")
    .single();

  if (batchError || !batchJob) {
    return new Response(
      JSON.stringify({ error: "작업 생성에 실패했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const batchId = batchJob.id;

  // SSE 스트림
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function sendEvent(event: AutoFittingSSEEvent) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      }

      let completedCount = 0;
      let failedCount = 0;

      // 5개 포즈 순차 처리
      for (let i = 0; i < presets.length; i++) {
        const preset = presets[i];

        sendEvent({
          type: "item_start",
          index: i,
          total: totalItems,
          status: "processing",
          poseName: preset.name,
        });

        const result = await processSingleStudioRequest({
          type: "auto-fitting",
          mode: "standard",
          sourceFile: sourceImage,
          userId,
          sessionId,
          batchId,
          skipTrialCheck: i > 0,
          aspectRatio: "1:1",
          imageSize: imageSize as "1K" | "2K" | "4K",
          userPrompt: preset.description,
          autoFittingStylePrompt: stylePrompt,
        });

        if (result.success) {
          completedCount++;
          sendEvent({
            type: "item_complete",
            index: i,
            total: totalItems,
            status: "success",
            poseName: preset.name,
            resultImageUrl: result.resultImageUrl,
            processingTime: result.processingTime,
          });
        } else {
          failedCount++;
          sendEvent({
            type: "item_error",
            index: i,
            total: totalItems,
            status: "error",
            poseName: preset.name,
            error: result.error,
          });

          // TOKEN_INSUFFICIENT이면 나머지 스킵
          if (result.code === "TOKEN_INSUFFICIENT") {
            for (let j = i + 1; j < presets.length; j++) {
              sendEvent({
                type: "item_error",
                index: j,
                total: totalItems,
                status: "skipped",
                poseName: presets[j].name,
                error: "토큰 부족으로 건너뛰었습니다.",
              });
            }
            break;
          }
        }

        // batch_jobs 진행률 업데이트
        await supabase
          .from("batch_jobs")
          .update({
            completed_items: completedCount,
            failed_items: failedCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", batchId);

        // Rate limit (마지막 아이템 제외)
        if (i < presets.length - 1) {
          await jitteredDelay();
        }
      }

      // 배치 완료
      const finalStatus =
        failedCount === totalItems ? "failed" : "completed";
      await supabase
        .from("batch_jobs")
        .update({
          status: finalStatus,
          completed_items: completedCount,
          failed_items: failedCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", batchId);

      sendEvent({
        type: "batch_complete",
        index: totalItems - 1,
        total: totalItems,
        status: "success",
        batchId,
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
