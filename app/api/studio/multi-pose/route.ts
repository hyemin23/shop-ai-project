import { type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { processSingleStudioRequest } from "@/lib/studio-processor";
import { type GenerationMode } from "@/types/studio";
import { type MultiPoseSSEEvent } from "@/types/multi-pose";
import { getTokenCost } from "@/lib/tokens";

export const maxDuration = 300;

const MAX_VARIATIONS = 5;
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

  const mode = (formData.get("mode") as GenerationMode) || "standard";
  const sourceImage = formData.get("sourceImage") as File | null;

  if (!sourceImage) {
    return new Response(
      JSON.stringify({ error: "소스 이미지가 필요합니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // 프롬프트 수집 (비어있지 않은 것만)
  const variations: { index: number; prompt: string }[] = [];
  for (let i = 0; i < MAX_VARIATIONS; i++) {
    const prompt = (formData.get(`prompt_${i}`) as string)?.trim();
    if (prompt) {
      variations.push({ index: i, prompt });
    }
  }

  if (variations.length === 0) {
    return new Response(
      JSON.stringify({ error: "최소 1개의 포즈 설명이 필요합니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // 토큰 사전 확인
  if (userId) {
    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("token_balance, is_master")
      .eq("id", userId)
      .single();

    if (profile && !profile.is_master) {
      const costPerItem = getTokenCost("multi-pose", mode);
      const totalCost = variations.length * costPerItem;

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
      type: "multi-pose",
      mode,
      total_items: variations.length,
      params: { prompts: variations.map((v) => v.prompt) },
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

      function sendEvent(event: MultiPoseSSEEvent) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      }

      let completedCount = 0;
      let failedCount = 0;

      // 2개 이하 → 병렬, 3개 이상 → 순차
      if (variations.length <= 2) {
        // 병렬 처리
        // 먼저 모든 아이템 시작 이벤트 전송
        for (const v of variations) {
          sendEvent({
            type: "item_start",
            index: v.index,
            total: variations.length,
            status: "processing",
            prompt: v.prompt,
          });
        }

        const results = await Promise.allSettled(
          variations.map((v) =>
            processSingleStudioRequest({
              type: "multi-pose",
              mode,
              sourceFile: sourceImage,
              userId,
              sessionId,
              batchId,
              skipTrialCheck: false,
              userPrompt: v.prompt,
            }),
          ),
        );

        for (let i = 0; i < variations.length; i++) {
          const v = variations[i];
          const result = results[i];

          if (
            result.status === "fulfilled" &&
            result.value.success
          ) {
            completedCount++;
            sendEvent({
              type: "item_complete",
              index: v.index,
              total: variations.length,
              status: "success",
              prompt: v.prompt,
              resultImageUrl: result.value.resultImageUrl,
              processingTime: result.value.processingTime,
            });
          } else {
            failedCount++;
            const error =
              result.status === "fulfilled"
                ? result.value.error
                : "처리 중 오류가 발생했습니다.";
            sendEvent({
              type: "item_error",
              index: v.index,
              total: variations.length,
              status: "error",
              prompt: v.prompt,
              error,
            });
          }
        }
      } else {
        // 순차 처리 (3개 이상)
        for (let i = 0; i < variations.length; i++) {
          const v = variations[i];

          sendEvent({
            type: "item_start",
            index: v.index,
            total: variations.length,
            status: "processing",
            prompt: v.prompt,
          });

          const result = await processSingleStudioRequest({
            type: "multi-pose",
            mode,
            sourceFile: sourceImage,
            userId,
            sessionId,
            batchId,
            skipTrialCheck: i > 0,
            userPrompt: v.prompt,
          });

          if (result.success) {
            completedCount++;
            sendEvent({
              type: "item_complete",
              index: v.index,
              total: variations.length,
              status: "success",
              prompt: v.prompt,
              resultImageUrl: result.resultImageUrl,
              processingTime: result.processingTime,
            });
          } else {
            failedCount++;
            sendEvent({
              type: "item_error",
              index: v.index,
              total: variations.length,
              status: result.code === "TOKEN_INSUFFICIENT" ? "error" : "error",
              prompt: v.prompt,
              error: result.error,
            });

            // TOKEN_INSUFFICIENT이면 나머지 스킵
            if (result.code === "TOKEN_INSUFFICIENT") {
              for (let j = i + 1; j < variations.length; j++) {
                sendEvent({
                  type: "item_error",
                  index: variations[j].index,
                  total: variations.length,
                  status: "skipped",
                  prompt: variations[j].prompt,
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
          if (i < variations.length - 1) {
            await jitteredDelay();
          }
        }
      }

      // 배치 완료
      const finalStatus =
        failedCount === variations.length ? "failed" : "completed";
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
        index: variations.length - 1,
        total: variations.length,
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
