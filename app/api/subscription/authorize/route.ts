import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { authorizeBillingKey, TossPaymentError } from "@/lib/toss";
import { SUBSCRIPTION_PLANS } from "@/config/pricing";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const { authKey, customerKey, planId } = await request.json();

    if (!authKey || !customerKey || !planId) {
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 플랜 검증
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json(
        { error: "유효하지 않은 구독 플랜입니다." },
        { status: 400 },
      );
    }

    // 기존 활성 구독 확인
    const supabase = createServiceClient();
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id, status, plan_id")
      .eq("user_id", user.id)
      .in("status", ["active", "past_due"])
      .limit(1)
      .single();

    if (existingSub) {
      return NextResponse.json(
        { error: "이미 활성 구독이 있습니다. 기존 구독을 해지한 후 다시 시도해주세요." },
        { status: 409 },
      );
    }

    // customerKey 검증 (user.id와 일치해야 함)
    if (customerKey !== user.id) {
      return NextResponse.json(
        { error: "잘못된 고객 정보입니다." },
        { status: 400 },
      );
    }

    // 토스 빌링키 발급 승인
    const billing = await authorizeBillingKey(authKey, customerKey);

    // 구독 기간 설정 (오늘 ~ 1달 후)
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // subscriptions 테이블에 레코드 생성
    const { error: subError } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan_id: planId,
      billing_key: billing.billingKey,
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    });

    if (subError) {
      console.error("Subscription create error:", subError);
      return NextResponse.json(
        { error: "구독 생성에 실패했습니다." },
        { status: 500 },
      );
    }

    // profiles.subscription_plan_id 업데이트
    await supabase
      .from("profiles")
      .update({ subscription_plan_id: planId })
      .eq("id", user.id);

    // 첫 달 토큰 즉시 충전
    const { data: newBalance, error: rpcError } = await supabase.rpc(
      "charge_tokens",
      {
        p_user_id: user.id,
        p_amount: plan.monthlyTokens,
        p_description: `${plan.name} 구독 시작 (${plan.monthlyTokens} 크레딧)`,
        p_reference_id: `sub_start_${billing.billingKey}_${Date.now()}`,
      },
    );

    if (rpcError) {
      console.error("Token charge error:", rpcError);
    }

    return NextResponse.json({
      success: true,
      balance: newBalance,
      charged: plan.monthlyTokens,
      plan: {
        id: plan.id,
        name: plan.name,
      },
      periodEnd: periodEnd.toISOString(),
    });
  } catch (error) {
    if (error instanceof TossPaymentError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    console.error("Subscription authorize error:", error);
    return NextResponse.json(
      { error: "구독 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
