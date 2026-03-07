import { type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { processSingleStudioRequest } from "@/lib/studio-processor";
import { type UgcSSEEvent, UGC_MAX_SCENES } from "@/types/ugc";
import { getUgcScenesForTarget } from "@/config/ugc";
import { getCreditCost } from "@/lib/tokens";
import { type UgcGender, type UgcAgeGroup } from "@/types/ugc";
import { type ImageSize } from "@/types/studio";

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

  // 토큰 사전 확인
  if (userId) {
    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("token_balance, is_master")
      .eq("id", userId)
      .single();

    if (profile && !profile.is_master) {
      const totalCost = getCreditCost(imageSize as ImageSize, totalItems);

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
      type: "ugc",
      mode: "standard",
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

      for (let i = 0; i < selectedScenes.length; i++) {
        const scene = selectedScenes[i];

        sendEvent({
          type: "item_start",
          index: i,
          total: totalItems,
          status: "processing",
          sceneName: scene.name,
        });

        const result = await processSingleStudioRequest({
          type: "ugc",
          mode: "standard",
          sourceFile: sourceImage,
          userId,
          sessionId,
          batchId,
          skipTrialCheck: i > 0,
          aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
          imageSize: imageSize as "1K" | "2K" | "4K",
          ugcGender: gender,
          ugcAgeGroup: ageGroup,
          ugcSceneDescription: scene.scene,
          userPrompt,
        });

        if (!result.success) {
          console.error(`[UGC] Scene "${scene.name}" failed:`, result.error, result.code);
        }

        if (result.success) {
          completedCount++;
          sendEvent({
            type: "item_complete",
            index: i,
            total: totalItems,
            status: "success",
            sceneName: scene.name,
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
            sceneName: scene.name,
            error: result.error,
          });

          if (result.code === "TOKEN_INSUFFICIENT") {
            for (let j = i + 1; j < selectedScenes.length; j++) {
              sendEvent({
                type: "item_error",
                index: j,
                total: totalItems,
                status: "skipped",
                sceneName: selectedScenes[j].name,
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
        if (i < selectedScenes.length - 1) {
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
