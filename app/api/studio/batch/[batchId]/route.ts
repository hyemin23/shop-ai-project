import { NextResponse, type NextRequest } from "next/server";
import { getUserOrSessionId } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { type BatchJob } from "@/types/batch";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const { batchId } = await params;
  const { userId, sessionId } = await getUserOrSessionId();
  const supabase = createServiceClient();

  // 배치 잡 조회
  const { data: job, error } = await supabase
    .from("batch_jobs")
    .select("*")
    .eq("id", batchId)
    .single();

  if (error || !job) {
    return NextResponse.json(
      { error: "배치 작업을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  // 권한 확인
  if (job.user_id !== userId && job.session_id !== sessionId) {
    return NextResponse.json(
      { error: "접근 권한이 없습니다." },
      { status: 403 },
    );
  }

  // 관련 히스토리 조회
  const { data: historyItems } = await supabase
    .from("studio_history")
    .select("id, result_image_url, processing_time, created_at")
    .eq("batch_id", batchId)
    .order("created_at", { ascending: true });

  const batchJob: BatchJob = {
    id: job.id,
    sessionId: job.session_id,
    userId: job.user_id || undefined,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
    status: job.status,
    type: job.type,
    mode: job.mode,
    totalItems: job.total_items,
    completedItems: job.completed_items,
    failedItems: job.failed_items,
    params: job.params,
  };

  return NextResponse.json({ job: batchJob, historyItems: historyItems || [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const { batchId } = await params;
  const { userId, sessionId } = await getUserOrSessionId();
  const supabase = createServiceClient();

  // 배치 잡 확인
  const { data: job } = await supabase
    .from("batch_jobs")
    .select("*")
    .eq("id", batchId)
    .single();

  if (!job) {
    return NextResponse.json(
      { error: "배치 작업을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  if (job.user_id !== userId && job.session_id !== sessionId) {
    return NextResponse.json(
      { error: "접근 권한이 없습니다." },
      { status: 403 },
    );
  }

  const body = await request.json();

  if (body.action === "retry") {
    // 실패 항목 재시도: 상태를 pending으로 리셋
    await supabase
      .from("batch_jobs")
      .update({
        status: "pending",
        failed_items: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", batchId);

    return NextResponse.json({ success: true, message: "재시도 준비 완료" });
  }

  return NextResponse.json(
    { error: "유효하지 않은 작업입니다." },
    { status: 400 },
  );
}
