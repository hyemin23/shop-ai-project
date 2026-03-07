import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const { immediate } = await request.json().catch(() => ({ immediate: false }));

    const supabase = createServiceClient();

    // 활성 구독 조회
    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "past_due"])
      .limit(1)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: "활성 구독이 없습니다." },
        { status: 404 },
      );
    }

    if (immediate) {
      // 즉시 취소: 상태를 canceled로 변경
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          cancel_at_period_end: false,
        })
        .eq("id", subscription.id);

      if (updateError) {
        return NextResponse.json(
          { error: "구독 취소에 실패했습니다." },
          { status: 500 },
        );
      }

      // profiles.subscription_plan_id 초기화
      await supabase
        .from("profiles")
        .update({ subscription_plan_id: null })
        .eq("id", user.id);

      return NextResponse.json({
        success: true,
        message: "구독이 즉시 취소되었습니다.",
        canceledAt: new Date().toISOString(),
      });
    } else {
      // 기간 만료 후 취소: cancel_at_period_end 설정
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ cancel_at_period_end: true })
        .eq("id", subscription.id);

      if (updateError) {
        return NextResponse.json(
          { error: "구독 취소 예약에 실패했습니다." },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "현재 구독 기간이 끝나면 자동으로 해지됩니다.",
        periodEnd: subscription.current_period_end,
      });
    }
  } catch (error) {
    console.error("Subscription cancel error:", error);
    return NextResponse.json(
      { error: "구독 취소 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
