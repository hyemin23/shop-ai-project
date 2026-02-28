import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, data } = body;

    // 멱등성: paymentKey로 중복 처리 방지
    if (eventType === "PAYMENT_STATUS_CHANGED" && data?.paymentKey) {
      const supabase = createServiceClient();

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ success: true });
  }
}
