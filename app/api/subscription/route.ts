import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const supabase = createServiceClient();

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, payment_failed_count, created_at")
      .eq("user_id", user.id)
      .in("status", ["active", "past_due"])
      .limit(1)
      .single();

    return NextResponse.json({
      subscription: subscription
        ? {
            id: subscription.id,
            planId: subscription.plan_id,
            status: subscription.status,
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            paymentFailedCount: subscription.payment_failed_count,
            createdAt: subscription.created_at,
          }
        : null,
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "구독 정보 조회에 실패했습니다." },
      { status: 500 },
    );
  }
}
