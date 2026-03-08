import { type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { processSingleStudioRequest } from "@/lib/studio-processor";
import { type AutoFittingSSEEvent } from "@/types/auto-fitting";
import { AUTO_FITTING_PRESETS } from "@/config/auto-fitting";
import { getCreditCost } from "@/lib/tokens";
import { type ImageSize, type GenerationMode } from "@/types/studio";
import { resolveMode } from "@/config/studio";
import { batchRateLimiter } from "@/lib/rate-limit";

export const maxDuration = 300;

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
      JSON.stringify({
        error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        retryAfterMs,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  const formData = await request.formData();

  const sourceImage = formData.get("sourceImage") as File | null;
  const imageSize = (formData.get("imageSize") as ImageSize) || "1K";
  const mode: GenerationMode = resolveMode(imageSize);
  const stylePrompt = (formData.get("stylePrompt") as string)?.trim() || undefined;

  if (!sourceImage) {
    return new Response(
      JSON.stringify({ error: "소스 이미지가 필요합니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const presets = AUTO_FITTING_PRESETS;
  const totalItems = presets.length;

  // 토큰 예약 (원자적으로 전체 비용 차감)
  const supabase = createServiceClient();
  const totalCost = getCreditCost(imageSize as ImageSize, totalItems);
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

      // 원자적 토큰 예약 (race condition 방지)
      const { error: reserveError } = await supabase.rpc("reserve_tokens", {
        p_user_id: userId,
        p_amount: totalCost,
        p_description: `auto-fitting ${totalItems}장 예약`,
        p_reference_id: null,
      });

      if (reserveError) {
        if (reserveError.message?.includes("TOKEN_INSUFFICIENT")) {
          return new Response(
            JSON.stringify({
              error: "토큰이 부족합니다.",
              code: "TOKEN_INSUFFICIENT",
            }),
            { status: 402, headers: { "Content-Type": "application/json" } },
          );
        }
        console.error("Token reserve error:", reserveError);
      } else {
        tokensReserved = true;
      }
    }
  }

  // batch_jobs 레코드 생성
  const { data: batchJob, error: batchError } = await supabase
    .from("batch_jobs")
    .insert({
      session_id: sessionId,
      user_id: userId,
      status: "processing",
      type: "auto-fitting",
      mode,
      total_items: totalItems,
      params: {
        presets: presets.map((p) => p.id),
        stylePrompt,
      },
    })
    .select("id")
    .single();

  if (batchError || !batchJob) {
    // 예약한 토큰 반환
    if (tokensReserved && userId) {
      await supabase.rpc("release_reserved_tokens", {
        p_user_id: userId,
        p_amount: totalCost,
        p_description: "자동피팅 작업 생성 실패 - 토큰 반환",
      });
    }
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

      // 동시 처리 (CONCURRENCY_LIMIT개씩)
      for (let chunkStart = 0; chunkStart < presets.length; chunkStart += CONCURRENCY_LIMIT) {
        const chunkEnd = Math.min(chunkStart + CONCURRENCY_LIMIT, presets.length);
        const chunk = presets.slice(chunkStart, chunkEnd);

        // 청크 내 아이템 시작 알림
        for (let i = 0; i < chunk.length; i++) {
          sendEvent({
            type: "item_start",
            index: chunkStart + i,
            total: totalItems,
            status: "processing",
            poseName: chunk[i].name,
          });
        }

        // 청크 내 병렬 처리
        const results = await Promise.allSettled(
          chunk.map((preset, i) =>
            processSingleStudioRequest({
              type: "auto-fitting",
              mode,
              sourceFile: sourceImage,
              userId,
              sessionId,
              batchId,
              skipTrialCheck: chunkStart + i > 0,
              aspectRatio: "1:1",
              imageSize: imageSize as "1K" | "2K" | "4K",
              userPrompt: preset.description,
              autoFittingStylePrompt: stylePrompt,
              skipTokenSpend: tokensReserved,
            }),
          ),
        );

        let shouldBreak = false;

        for (let i = 0; i < results.length; i++) {
          const idx = chunkStart + i;
          const settled = results[i];
          const result =
            settled.status === "fulfilled"
              ? settled.value
              : {
                  success: false,
                  error: (settled.reason as Error)?.message ?? "처리 실패",
                  processingTime: 0,
                  code: undefined as string | undefined,
                };

          if (result.success) {
            completedCount++;
            sendEvent({
              type: "item_complete",
              index: idx,
              total: totalItems,
              status: "success",
              poseName: presets[idx].name,
              resultImageUrl: result.resultImageUrl,
              processingTime: result.processingTime,
            });
          } else {
            failedCount++;
            sendEvent({
              type: "item_error",
              index: idx,
              total: totalItems,
              status: "error",
              poseName: presets[idx].name,
              error: result.error,
            });

            if (result.code === "TOKEN_INSUFFICIENT") {
              for (let j = idx + 1; j < presets.length; j++) {
                sendEvent({
                  type: "item_error",
                  index: j,
                  total: totalItems,
                  status: "skipped",
                  poseName: presets[j].name,
                  error: "토큰 부족으로 건너뛰었습니다.",
                });
              }
              shouldBreak = true;
              break;
            }
          }
        }

        if (shouldBreak) break;

        // 청크 간 Rate limit
        if (chunkEnd < presets.length) {
          await jitteredDelay();
        }
      }

      // 배치 완료 (N+1 제거: 완료 시에만 DB 업데이트)
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

      // 예약 토큰 중 미사용분 반환
      if (tokensReserved && userId && failedCount > 0) {
        const perItemCost = getCreditCost(imageSize as ImageSize, 1);
        const unusedTokens = perItemCost * failedCount;
        if (unusedTokens > 0) {
          await supabase.rpc("release_reserved_tokens", {
            p_user_id: userId,
            p_amount: unusedTokens,
            p_description: `auto-fitting 실패분 ${failedCount}장 토큰 반환`,
            p_reference_id: batchId,
          });
        }
      }

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
