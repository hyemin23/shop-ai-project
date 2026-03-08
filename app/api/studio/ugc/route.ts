import { type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { processSingleStudioRequest } from "@/lib/studio-processor";
import { type UgcSSEEvent, UGC_MAX_SCENES } from "@/types/ugc";
import { getUgcScenesForTarget } from "@/config/ugc";
import { getCreditCost } from "@/lib/tokens";
import { type UgcGender, type UgcAgeGroup } from "@/types/ugc";
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
      JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", retryAfterMs }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  const formData = await request.formData();

  const sourceImage = formData.get("sourceImage") as File | null;
  const imageSize = (formData.get("imageSize") as ImageSize) || "1K";
  const mode: GenerationMode = resolveMode(imageSize);
  const gender = (formData.get("gender") as UgcGender) || "female";
  const ageGroup = (formData.get("ageGroup") as UgcAgeGroup) || "20s";
  const aspectRatio = (formData.get("aspectRatio") as string) || "9:16";
  const selectedScenesJson = formData.get("selectedScenes") as string;
  const userPrompt = (formData.get("userPrompt") as string)?.trim() || undefined;

  if (!sourceImage) {
    return new Response(
      JSON.stringify({ error: "소스 이미지가 필요합니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  let selectedSceneIds: string[];
  try {
    selectedSceneIds = JSON.parse(selectedScenesJson || "[]");
  } catch {
    return new Response(
      JSON.stringify({ error: "장소 선택 데이터가 올바르지 않습니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (selectedSceneIds.length === 0) {
    return new Response(
      JSON.stringify({ error: "최소 1개 장소를 선택해주세요." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (selectedSceneIds.length > UGC_MAX_SCENES) {
    return new Response(
      JSON.stringify({ error: `최대 ${UGC_MAX_SCENES}개 장소까지 선택 가능합니다.` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const allScenes = getUgcScenesForTarget(gender, ageGroup);
  const selectedScenes = selectedSceneIds
    .map((id) => allScenes.find((s) => s.id === id))
    .filter(Boolean) as typeof allScenes;

  if (selectedScenes.length === 0) {
    return new Response(
      JSON.stringify({ error: "유효한 장소가 없습니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const totalItems = selectedScenes.length;

  // 토큰 예약 (원자적)
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

      const { error: reserveError } = await supabase.rpc("reserve_tokens", {
        p_user_id: userId,
        p_amount: totalCost,
        p_description: `ugc ${totalItems}장 예약`,
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

  // batch_jobs 레코드 생성
  const { data: batchJob, error: batchError } = await supabase
    .from("batch_jobs")
    .insert({
      session_id: sessionId,
      user_id: userId,
      status: "processing",
      type: "ugc",
      mode,
      total_items: totalItems,
      params: {
        gender,
        ageGroup,
        scenes: selectedScenes.map((s) => s.id),
        userPrompt,
      },
    })
    .select("id")
    .single();

  if (batchError || !batchJob) {
    if (tokensReserved && userId) {
      await supabase.rpc("release_reserved_tokens", {
        p_user_id: userId,
        p_amount: totalCost,
        p_description: "UGC 작업 생성 실패 - 토큰 반환",
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

      function sendEvent(event: UgcSSEEvent) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      }

      let completedCount = 0;
      let failedCount = 0;

      // 동시 처리 (CONCURRENCY_LIMIT개씩)
      for (let chunkStart = 0; chunkStart < selectedScenes.length; chunkStart += CONCURRENCY_LIMIT) {
        const chunkEnd = Math.min(chunkStart + CONCURRENCY_LIMIT, selectedScenes.length);
        const chunk = selectedScenes.slice(chunkStart, chunkEnd);

        for (let i = 0; i < chunk.length; i++) {
          sendEvent({
            type: "item_start",
            index: chunkStart + i,
            total: totalItems,
            status: "processing",
            sceneName: chunk[i].name,
          });
        }

        const results = await Promise.allSettled(
          chunk.map((scene, i) =>
            processSingleStudioRequest({
              type: "ugc",
              mode,
              sourceFile: sourceImage,
              userId,
              sessionId,
              batchId,
              skipTrialCheck: chunkStart + i > 0,
              aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
              imageSize: imageSize as "1K" | "2K" | "4K",
              ugcGender: gender,
              ugcAgeGroup: ageGroup,
              ugcSceneDescription: scene.scene,
              userPrompt,
              skipTokenSpend: tokensReserved,
            }),
          ),
        );

        let shouldBreak = false;

        for (let i = 0; i < results.length; i++) {
          const globalIndex = chunkStart + i;
          const scene = chunk[i];
          const result = results[i];

          if (result.status === "fulfilled" && result.value.success) {
            completedCount++;
            sendEvent({
              type: "item_complete",
              index: globalIndex,
              total: totalItems,
              status: "success",
              sceneName: scene.name,
              resultImageUrl: result.value.resultImageUrl,
              processingTime: result.value.processingTime,
            });
          } else {
            failedCount++;
            const error = result.status === "fulfilled"
              ? result.value.error
              : "처리 중 오류가 발생했습니다.";
            const code = result.status === "fulfilled" ? result.value.code : undefined;

            if (result.status === "fulfilled") {
              console.error(`[UGC] Scene "${scene.name}" failed:`, error, code);
            }

            sendEvent({
              type: "item_error",
              index: globalIndex,
              total: totalItems,
              status: "error",
              sceneName: scene.name,
              error,
            });

            if (code === "TOKEN_INSUFFICIENT") {
              for (let j = globalIndex + 1; j < selectedScenes.length; j++) {
                sendEvent({
                  type: "item_error",
                  index: j,
                  total: totalItems,
                  status: "skipped",
                  sceneName: selectedScenes[j].name,
                  error: "토큰 부족으로 건너뛰었습니다.",
                });
              }
              shouldBreak = true;
              break;
            }
          }
        }

        if (shouldBreak) break;

        if (chunkEnd < selectedScenes.length) {
          await jitteredDelay();
        }
      }

      // 배치 완료 (N+1 제거: 완료 시에만 DB 업데이트)
      const finalStatus = failedCount === totalItems ? "failed" : "completed";
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
            p_description: `ugc 실패분 ${failedCount}장 토큰 반환`,
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
