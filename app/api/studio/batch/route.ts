import { type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { processSingleStudioRequest } from "@/lib/studio-processor";
import { type GenerationMode, type StudioType } from "@/types/studio";
import { type BatchSSEEvent } from "@/types/batch";
import { getCreditCost } from "@/lib/tokens";
import { parseImageSize } from "@/lib/api-utils";
import {
  createGenerationLog,
  updateGenerationLog,
} from "@/lib/generation-log";

export const maxDuration = 300;

const MAX_BATCH_SIZE = 10;
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

  const type = formData.get("type") as StudioType;
  const mode = (formData.get("mode") as GenerationMode) || "standard";
  const imageSize = parseImageSize(formData.get("imageSize") as string | null);

  if (!type || !["try-on", "color-swap", "pose-transfer", "background-swap"].includes(type)) {
    return new Response(JSON.stringify({ error: "유효하지 않은 작업 유형입니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 소스 이미지 수집
  const sourceFiles: File[] = [];
  for (let i = 0; i < MAX_BATCH_SIZE; i++) {
    const file = formData.get(`sourceImage_${i}`) as File | null;
    if (file) sourceFiles.push(file);
  }

  if (sourceFiles.length === 0) {
    return new Response(
      JSON.stringify({ error: "최소 1장의 이미지가 필요합니다." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (sourceFiles.length > MAX_BATCH_SIZE) {
    return new Response(
      JSON.stringify({ error: `최대 ${MAX_BATCH_SIZE}장까지 처리 가능합니다.` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // 공통 파라미터 추출
  const referenceFile = formData.get("referenceImage") as File | null;
  const targetColor = formData.get("targetColor") as string | null;
  const garmentRegion = (formData.get("garmentRegion") as string) || "auto";
  const poseType = formData.get("poseType") as "preset" | "custom" | null;
  const presetId = formData.get("presetId") as string | null;
  const poseReferenceFile = formData.get("poseReferenceImage") as File | null;
  const userPrompt = formData.get("userPrompt") as string | null;

  // 토큰 사전 확인
  const supabase = createServiceClient();
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("token_balance, is_master")
      .eq("id", userId)
      .single();

    if (profile && !profile.is_master) {
      const totalCost = getCreditCost(imageSize, sourceFiles.length);

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
  const { data: batchJob, error: batchError } = await supabase
    .from("batch_jobs")
    .insert({
      session_id: sessionId,
      user_id: userId,
      status: "processing",
      type,
      mode,
      total_items: sourceFiles.length,
      params: { targetColor, garmentRegion, poseType, presetId },
    })
    .select("id")
    .single();

  if (batchError || !batchJob) {
    return new Response(
      JSON.stringify({ error: "배치 작업 생성에 실패했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const batchId = batchJob.id;

  // 배치 generation log 생성
  const batchLogId = await createGenerationLog({
    userId,
    sessionId,
    serviceType: "studio",
    action: `batch-${type}`,
    params: {
      batchId,
      totalItems: sourceFiles.length,
      targetColor,
      garmentRegion,
      poseType,
      presetId,
    },
  });

  // SSE 스트림
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function sendEvent(event: BatchSSEEvent) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      let completedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < sourceFiles.length; i++) {
        // 아이템 시작 이벤트
        sendEvent({
          type: "item_start",
          index: i,
          total: sourceFiles.length,
          status: "processing",
        });

        const result = await processSingleStudioRequest({
          type,
          mode,
          sourceFile: sourceFiles[i],
          referenceFile,
          targetColor: targetColor || undefined,
          garmentRegion,
          poseType: poseType || undefined,
          presetId: presetId || undefined,
          poseReferenceFile,
          userId,
          sessionId,
          batchId,
          skipTrialCheck: i > 0,
          imageSize,
          userPrompt: userPrompt || undefined,
        });

        if (result.success) {
          completedCount++;
          sendEvent({
            type: "item_complete",
            index: i,
            total: sourceFiles.length,
            status: "success",
            resultImageUrl: result.resultImageUrl,
            processingTime: result.processingTime,
          });
        } else {
          failedCount++;
          sendEvent({
            type: "item_error",
            index: i,
            total: sourceFiles.length,
            status: "error",
            error: result.error,
          });

          // TOKEN_INSUFFICIENT이면 나머지 스킵
          if (result.code === "TOKEN_INSUFFICIENT") {
            for (let j = i + 1; j < sourceFiles.length; j++) {
              sendEvent({
                type: "item_error",
                index: j,
                total: sourceFiles.length,
                status: "skipped",
                error: "토큰 부족으로 건너뛰었습니다.",
              });
            }
            break;
          }
        }

        // 업데이트 batch_jobs 진행률
        await supabase
          .from("batch_jobs")
          .update({
            completed_items: completedCount,
            failed_items: failedCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", batchId);

        // Rate limit (마지막 아이템 제외)
        if (i < sourceFiles.length - 1) {
          await jitteredDelay();
        }
      }

      // 배치 완료 업데이트
      const finalStatus = failedCount === sourceFiles.length ? "failed" : "completed";
      await supabase
        .from("batch_jobs")
        .update({
          status: finalStatus,
          completed_items: completedCount,
          failed_items: failedCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", batchId);

      // 배치 로그 업데이트
      await updateGenerationLog(batchLogId, {
        status: failedCount === sourceFiles.length ? "failed" : "succeed",
        referenceId: batchId,
        completedAt: new Date().toISOString(),
        errorMessage:
          failedCount > 0
            ? `${failedCount}/${sourceFiles.length}건 실패`
            : undefined,
      });

      sendEvent({
        type: "batch_complete",
        index: sourceFiles.length - 1,
        total: sourceFiles.length,
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
