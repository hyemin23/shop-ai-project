import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import {
  getCachedTokenBalance,
  setCachedTokenBalance,
} from "@/lib/cache";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    // _ 파라미터가 있으면 캐시 우회 (admin layout 접근 제어용)
    const { searchParams } = new URL(request.url);
    const bypassCache = searchParams.has("_");

    // LRU 캐시 확인
    const cached = !bypassCache && getCachedTokenBalance(user.id);
    if (cached) {
      return NextResponse.json(cached);
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("token_balance, free_tokens_used, is_master, is_beta")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Token balance query error:", error);
      return NextResponse.json(
        { error: "토큰 잔액 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    const result = {
      balance: data?.token_balance ?? 0,
      freeTokensUsed: data?.free_tokens_used ?? 0,
      isMaster: data?.is_master ?? false,
      isBeta: data?.is_beta ?? false,
    };

    setCachedTokenBalance(user.id, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Token balance error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
