import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { confirmPayment, TossPaymentError } from "@/lib/toss";
import { TOKEN_PACKAGES } from "@/config/pricing";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const { paymentKey, orderId, amount, packageId } = await request.json();

    if (!paymentKey || !orderId || !amount || !packageId) {
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 패키지 검증
    const pkg = TOKEN_PACKAGES.find((p) => p.id === packageId);
    if (!pkg || pkg.price !== amount) {
      return NextResponse.json(
        { error: "유효하지 않은 결제 정보입니다." },
        { status: 400 },
      );
    }

    // 토스 결제 승인
    const payment = await confirmPayment(paymentKey, orderId, amount);

    // 토큰 충전 (패키지 토큰 + 보너스)
    const totalTokens = pkg.tokens + (pkg.bonusTokens ?? 0);
    const supabase = createServiceClient();

    const { data: newBalance, error: rpcError } = await supabase.rpc(
      "charge_tokens",
      {
        p_user_id: user.id,
        p_amount: totalTokens,
        p_description: `${pkg.name} 패키지 충전 (${pkg.tokens}${pkg.bonusTokens ? ` + 보너스 ${pkg.bonusTokens}` : ""} 토큰)`,
        p_reference_id: payment.paymentKey,
      },
    );

    if (rpcError) {
      console.error("Token charge error:", rpcError);
      return NextResponse.json(
        { error: "토큰 충전에 실패했습니다. 고객센터에 문의해주세요." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      balance: newBalance,
      charged: totalTokens,
      paymentKey: payment.paymentKey,
    });
  } catch (error) {
    if (error instanceof TossPaymentError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    console.error("Payment confirm error:", error);
    return NextResponse.json(
      { error: "결제 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
