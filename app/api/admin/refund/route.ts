import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { refundGenerationLog } from "@/lib/generation-log";
import { invalidateTokenBalance } from "@/lib/cache";
import { requireMaster } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const { error: authError } = await requireMaster();
    if (authError) return authError;

    const supabase = createServiceClient();

    const body = await request.json();
    const { logId, reason } = body;

    if (!logId || typeof logId !== "string") {
      return NextResponse.json(
        { error: "logId가 필요합니다." },
        { status: 400 },
      );
    }

    // 로그 존재 확인 및 user_id 조회
    const { data: log } = await supabase
      .from("generation_log")
      .select("user_id")
      .eq("id", logId)
      .single();

    if (!log) {
      return NextResponse.json(
        { error: "해당 로그를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const result = await refundGenerationLog(logId);

    if (!result.refunded) {
      return NextResponse.json(
        { error: "환불할 토큰이 없거나 이미 환불되었습니다." },
        { status: 400 },
      );
    }

    // 환불 사유 기록
    if (reason) {
      await supabase
        .from("generation_log")
        .update({
          error_message: `[관리자 환불] ${reason}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", logId);
    }

    if (log.user_id) {
      invalidateTokenBalance(log.user_id);
    }

    return NextResponse.json({
      success: true,
      refundedAmount: result.amount,
    });
  } catch (error) {
    console.error("Admin refund error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
