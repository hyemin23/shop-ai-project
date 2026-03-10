import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requestBillingPayment, TossPaymentError } from "@/lib/toss";
import { SUBSCRIPTION_PLANS } from "@/config/pricing";
import { timingSafeEqual } from "node:crypto";

function verifyCronSecret(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !authHeader) return false;
  const expected = `Bearer ${secret}`;
  if (expected.length !== authHeader.length) return false;
  return timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(authHeader),
  );
}

export async function GET(request: NextRequest) {
  // Vercel Cron 인증
  if (!verifyCronSecret(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // 갱신 대상 구독 조회: 기간 만료 + 활성 상태
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("id, user_id, plan_id, billing_key, cancel_at_period_end, payment_failed_count")
    .eq("status", "active")
    .lte("current_period_end", now);

  if (error || !subscriptions) {
    console.error("Cron: failed to fetch subscriptions", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }

  const results: { id: string; success: boolean; error?: string }[] = [];

  for (const sub of subscriptions) {
    // 기간 만료 + 해지 예약된 구독 → canceled 처리
    if (sub.cancel_at_period_end) {
      await supabase
        .from("subscriptions")
        .update({ status: "canceled", cancel_at_period_end: false })
        .eq("id", sub.id);

      await supabase
        .from("profiles")
        .update({ subscription_plan_id: null })
        .eq("id", sub.user_id);

      results.push({ id: sub.id, success: true, error: "canceled_at_period_end" });
      continue;
    }

    // 빌링키 없으면 결제 불가
    if (!sub.billing_key) {
      results.push({ id: sub.id, success: false, error: "no_billing_key" });
      continue;
    }

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === sub.plan_id);
    if (!plan) {
      results.push({ id: sub.id, success: false, error: "invalid_plan" });
      continue;
    }

    const orderId = `sub_renew_${sub.id}_${Date.now()}`;

    try {
      const payment = await requestBillingPayment(
        sub.billing_key,
        plan.monthlyPrice,
        orderId,
        `똑픽 ${plan.name} 월간 구독`,
        sub.user_id,
      );

      // 결제 성공: 토큰 충전 + 기간 갱신
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await supabase.rpc("charge_tokens", {
        p_user_id: sub.user_id,
        p_amount: plan.monthlyTokens,
        p_description: `${plan.name} 구독 갱신 (${plan.monthlyTokens} 크레딧)`,
        p_reference_id: payment.paymentKey,
      });

      await supabase
        .from("subscriptions")
        .update({
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          payment_failed_count: 0,
        })
        .eq("id", sub.id);

      results.push({ id: sub.id, success: true });
    } catch (err) {
      // 결제 실패 처리
      const newCount = (sub.payment_failed_count ?? 0) + 1;
      await supabase
        .from("subscriptions")
        .update({
          payment_failed_count: newCount,
          status: newCount >= 3 ? "past_due" : "active",
        })
        .eq("id", sub.id);

      const errorMsg = err instanceof TossPaymentError ? err.message : "Unknown error";
      results.push({ id: sub.id, success: false, error: errorMsg });
    }
  }

  return NextResponse.json({
    processed: subscriptions.length,
    results,
    timestamp: now,
  });
}
