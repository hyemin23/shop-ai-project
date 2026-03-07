import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_PLANS } from "@/config/pricing";
import { verifyWebhookSecret, getPayment } from "@/lib/toss";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, data } = body;

    // 1) 웹훅 시크릿 검증 (토스 대시보드에서 설정한 secret)
    if (!verifyWebhookSecret(body)) {
      console.error("Webhook secret mismatch");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    // 멱등성: paymentKey로 중복 처리 방지
    if (eventType === "PAYMENT_STATUS_CHANGED" && data?.paymentKey) {
      // 2) 토스 결제 조회 API로 실제 결제 존재 여부 검증
      const payment = await getPayment(data.paymentKey);
      if (!payment) {
        console.error("Payment verification failed:", data.paymentKey);
        return NextResponse.json({ success: false, message: "Invalid payment" }, { status: 400 });
      }

      // 이미 처리된 결제인지 확인
      const { data: existing } = await supabase
        .from("token_transactions")
        .select("id")
        .eq("reference_id", data.paymentKey)
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json({ success: true, message: "Already processed" });
      }

      // 결제 취소 처리
      if (data.status === "CANCELED") {
        console.log("Payment canceled:", data.paymentKey);
      }
    }

    // 빌링(정기결제) 이벤트 처리
    if (eventType === "BILLING_PAYMENT_FAILED" && data?.billingKey) {
      // 결제 실패 시 구독 상태 업데이트
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("id, payment_failed_count")
        .eq("billing_key", data.billingKey)
        .eq("status", "active")
        .limit(1)
        .single();

      if (subscription) {
        const newCount = (subscription.payment_failed_count ?? 0) + 1;
        await supabase
          .from("subscriptions")
          .update({
            payment_failed_count: newCount,
            status: newCount >= 3 ? "past_due" : "active",
          })
          .eq("id", subscription.id);
      }
    }

    if (eventType === "BILLING_PAID" && data?.billingKey) {
      // 3) paymentKey가 있으면 결제 조회 API로 검증
      if (data.paymentKey) {
        const payment = await getPayment(data.paymentKey);
        if (!payment) {
          console.error("Billing payment verification failed:", data.paymentKey);
          return NextResponse.json({ success: false, message: "Invalid payment" }, { status: 400 });
        }
      }

      // 자동결제 성공 시 토큰 충전
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("id, user_id, plan_id")
        .eq("billing_key", data.billingKey)
        .in("status", ["active", "past_due"])
        .limit(1)
        .single();

      if (subscription) {
        const plan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription.plan_id);
        if (plan) {
          // 중복 처리 방지
          const referenceId = `billing_${data.paymentKey ?? data.billingKey}_${Date.now()}`;
          const { data: existingCharge } = await supabase
            .from("token_transactions")
            .select("id")
            .eq("reference_id", referenceId)
            .limit(1);

          if (!existingCharge || existingCharge.length === 0) {
            await supabase.rpc("charge_tokens", {
              p_user_id: subscription.user_id,
              p_amount: plan.monthlyTokens,
              p_description: `${plan.name} 구독 갱신 (${plan.monthlyTokens} 크레딧)`,
              p_reference_id: referenceId,
            });

            // 구독 기간 갱신 및 실패 카운트 초기화
            const now = new Date();
            const periodEnd = new Date(now);
            periodEnd.setMonth(periodEnd.getMonth() + 1);

            await supabase
              .from("subscriptions")
              .update({
                current_period_start: now.toISOString(),
                current_period_end: periodEnd.toISOString(),
                payment_failed_count: 0,
                status: "active",
              })
              .eq("id", subscription.id);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ success: true });
  }
}
