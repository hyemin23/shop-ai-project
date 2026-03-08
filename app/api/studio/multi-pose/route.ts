import { type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { processSingleStudioRequest } from "@/lib/studio-processor";
import { type GenerationMode, type ImageSize } from "@/types/studio";
import { type MultiPoseSSEEvent } from "@/types/multi-pose";
import { getCreditCost } from "@/lib/tokens";
import { parseImageSize } from "@/lib/api-utils";
import { batchRateLimiter } from "@/lib/rate-limit";

export const maxDuration = 300;

const MAX_VARIATIONS = 5;
const CONCURRENCY_LIMIT = 3;
const RATE_LIMIT_BASE_MS = 2000;

function jitteredDelay(): Promise<void> {
  const jitter = Math.random() * 1000;
  return new Promise((resolve) =>
    setTimeout(resolve, RATE_LIMIT_BASE_MS + jitter),
  );
}

export async function POST(request: NextRequest) {
  const { userId, sessionId } = await getUserOrSessionId();

  // Rate limiting
  const rateLimitId = userId || sessionId;
  const { allowed, retryAfterMs } = batchRateLimiter.check(rateLimitId);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", retryAfterMs }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  const formData = await request.formData();

  const mode = (formData.get("mode") as GenerationMode) || "standard";
  const imageSize = parseImageSize(formData.get("imageSize") as string | null);
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

  // 토큰 예약 (원자적)
  const supabase = createServiceClient();
  const totalCost = getCreditCost(imageSize, variations.length);
  let tokensReserved = false;

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("token_balance, is_master, is_beta")
      .eq("id", userId)
      .single();

    if (profile && !profile.is_master && !profile.is_beta) {
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

      const { error: reserveError } = await supabase.rpc("reserve_tokens", {
        p_user_id: userId,
        p_amount: totalCost,
        p_description: `multi-pose ${variations.length}장 예약`,
      });

      if (reserveError) {
        if (reserveError.message?.includes("TOKEN_INSUFFICIENT")) {
          return new Response(
            JSON.stringify({ error: "토큰이 부족합니다.", code: "TOKEN_INSUFFICIENT" }),
            { status: 402, headers: { "Content-Type": "application/json" } },
          );
        }
        console.error("Token reserve error:", reserveError);
      } else {
        tokensReserved = true;
      }
    }
  }
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

      // 동시 처리 (CONCURRENCY_LIMIT개씩)
      for (let chunkStart = 0; chunkStart < variations.length; chunkStart += CONCURRENCY_LIMIT) {
        const chunkEnd = Math.min(chunkStart + CONCURRENCY_LIMIT, variations.length);
        const chunk = variations.slice(chunkStart, chunkEnd);

        for (const v of chunk) {
          sendEvent({
            type: "item_start",
            index: v.index,
            total: variations.length,
            status: "processing",
            prompt: v.prompt,
          });
        }

        const results = await Promise.allSettled(
          chunk.map((v, i) =>
            processSingleStudioRequest({
              type: "multi-pose",
              mode,
              sourceFile: sourceImage,
              userId,
              sessionId,
              batchId,
              skipTrialCheck: chunkStart + i > 0,
              imageSize,
              userPrompt: v.prompt,
              skipTokenSpend: tokensReserved,
            }),
          ),
        );

        let shouldBreak = false;

        for (let i = 0; i < results.length; i++) {
          const v = chunk[i];
          const result = results[i];

          if (result.status === "fulfilled" && result.value.success) {
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
            const error = result.status === "fulfilled"
              ? result.value.error
              : "처리 중 오류가 발생했습니다.";
            const code = result.status === "fulfilled" ? result.value.code : undefined;

            sendEvent({
              type: "item_error",
              index: v.index,
              total: variations.length,
              status: "error",
              prompt: v.prompt,
              error,
            });

            if (code === "TOKEN_INSUFFICIENT") {
              const remaining = variations.slice(chunkStart + i + 1);
              for (const rv of remaining) {
                sendEvent({
                  type: "item_error",
                  index: rv.index,
                  total: variations.length,
                  status: "skipped",
                  prompt: rv.prompt,
                  error: "토큰 부족으로 건너뛰었습니다.",
                });
              }
              shouldBreak = true;
              break;
            }
          }
        }

        if (shouldBreak) break;

        if (chunkEnd < variations.length) {
          await jitteredDelay();
        }
      }

      // 배치 완료 (N+1 제거: 완료 시에만 DB 업데이트)
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

      // 예약 토큰 중 미사용분 반환
      if (tokensReserved && userId && failedCount > 0) {
        const perItemCost = getCreditCost(imageSize, 1);
        const unusedTokens = perItemCost * failedCount;
        if (unusedTokens > 0) {
          await supabase.rpc("release_reserved_tokens", {
            p_user_id: userId,
            p_amount: unusedTokens,
            p_description: `multi-pose 실패분 ${failedCount}장 토큰 반환`,
            p_reference_id: batchId,
          });
        }
      }

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
