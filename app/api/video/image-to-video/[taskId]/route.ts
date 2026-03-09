import { NextResponse, type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { queryImageToVideoTask } from "@/lib/kling";
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
    const { userId, sessionId } = await getUserOrSessionId();
    const { taskId } = await params;

    // taskId 소유권 검증
    const logOwner = await verifyTaskOwnership(taskId, userId, sessionId);
    if (!logOwner) {
      return NextResponse.json(
        { success: false, status: "failed", error: "접근 권한이 없습니다." },
        { status: 403 },
      );
    }

    const response = await queryImageToVideoTask(taskId);

    if (response.code !== 0) {
      const logId = await findLogIdByTaskId(taskId);
      if (logId) {
        await updateGenerationLog(logId, {
          status: "failed",
          errorCode: "POLL_API_ERROR",
          errorMessage: response.message || "상태 조회에 실패했습니다.",
        });
        await refundGenerationLog(logId);
      }

      console.error("Video poll API error:", response.message);
      return NextResponse.json(
        {
          success: false,
          taskId,
          status: "failed",
          error: "상태 조회에 실패했습니다.",
        },
        { status: 500 },
      );
    }

    const { task_status, task_status_msg, task_result } = response.data;

    const videoUrl =
      task_status === "succeed" ? task_result?.videos?.[0]?.url : undefined;

    if (task_status === "succeed" || task_status === "failed") {
      const logId = await findLogIdByTaskId(taskId);
      if (logId) {
        if (task_status === "succeed") {
          await updateGenerationLog(logId, {
            status: "succeed",
            referenceId: videoUrl || undefined,
            completedAt: new Date().toISOString(),
          });
        } else {
          await updateGenerationLog(logId, {
            status: "failed",
            errorCode: "VIDEO_GEN_FAILED",
            errorMessage: task_status_msg || "비디오 생성 실패",
          });
          await refundGenerationLog(logId);
        }
      }
    }

    if (task_status === "failed") {
      console.error("Video generation failed:", task_status_msg);
    }

    return NextResponse.json({
      success: true,
      taskId,
      status: task_status,
      videoUrl,
      error: task_status === "failed" ? "비디오 생성에 실패했습니다." : undefined,
    });
  } catch (error) {
    console.error("Query image-to-video error:", error);
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

async function verifyTaskOwnership(
  taskId: string,
  userId: string | null,
  sessionId: string,
): Promise<boolean> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("generation_log")
    .select("id")
    .eq("external_task_id", taskId)
    .or(
      userId
        ? `user_id.eq.${userId},session_id.eq.${sessionId}`
        : `session_id.eq.${sessionId}`,
    )
    .single();
  return !!data;
}
