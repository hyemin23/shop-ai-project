import { NextResponse, type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { queryTextToVideoTask } from "@/lib/kling";
import { createServiceClient } from "@/lib/supabase/server";
import {
  updateGenerationLog,
  refundGenerationLog,
} from "@/lib/generation-log";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    await getUserOrSessionId();
    const { taskId } = await params;

    const response = await queryTextToVideoTask(taskId);

    if (response.code !== 0) {
      // 폴링 API 자체 실패 — generation_log 업데이트
      const logId = await findLogIdByTaskId(taskId);
      if (logId) {
        await updateGenerationLog(logId, {
          status: "failed",
          errorCode: "POLL_API_ERROR",
          errorMessage: response.message || "상태 조회에 실패했습니다.",
        });
        await refundGenerationLog(logId);
      }

      return NextResponse.json(
        {
          success: false,
          taskId,
          status: "failed",
          error: response.message || "상태 조회에 실패했습니다.",
        },
        { status: 500 },
      );
    }

    const { task_status, task_status_msg, task_result } = response.data;

    const videoUrl =
      task_status === "succeed" ? task_result?.videos?.[0]?.url : undefined;

    // Kling 작업 완료/실패 시 generation_log 업데이트
    if (task_status === "succeed" || task_status === "failed") {
      const logId = await findLogIdByTaskId(taskId);
      if (logId) {
        if (task_status === "succeed") {
          await updateGenerationLog(logId, {
            status: "succeed",
            completedAt: new Date().toISOString(),
          });
        } else {
          await updateGenerationLog(logId, {
            status: "failed",
            errorCode: "KLING_FAILED",
            errorMessage: task_status_msg || "비디오 생성 실패",
          });
          await refundGenerationLog(logId);
        }
      }
    }

    return NextResponse.json({
      success: true,
      taskId,
      status: task_status,
      videoUrl,
      error: task_status === "failed" ? task_status_msg : undefined,
    });
  } catch (error) {
    console.error("Query text-to-video error:", error);
    return NextResponse.json(
      {
        success: false,
        status: "failed",
        error: "상태 조회 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

async function findLogIdByTaskId(taskId: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("generation_log")
    .select("id")
    .eq("external_task_id", taskId)
    .single();
  return data?.id ?? null;
}
