import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { invalidateTokenBalance } from "@/lib/cache";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const supabase = createServiceClient();

    // 마스터 계정 확인
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_master")
      .eq("id", user.id)
      .single();

    if (!profile?.is_master) {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const amount = Number(body.amount);

    if (!Number.isInteger(amount) || amount < 1 || amount > 100000) {
      return NextResponse.json(
        { error: "충전량은 1~100,000 사이의 정수여야 합니다." },
        { status: 400 },
      );
    }

    const { data: newBalance, error } = await supabase.rpc("charge_tokens", {
      p_user_id: user.id,
      p_amount: amount,
      p_description: `마스터 계정 직접 충전 (${amount} 토큰)`,
      p_reference_id: null,
    });

    if (error) {
      console.error("Master charge error:", error);
      return NextResponse.json(
        { error: "충전에 실패했습니다." },
        { status: 500 },
      );
    }

    invalidateTokenBalance(user.id);

    return NextResponse.json({ success: true, charged: amount, balance: newBalance });
  } catch (error) {
    console.error("Master charge error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
