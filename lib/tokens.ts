import { CREDIT_COST, FREE_TRIAL_TOKENS } from "@/config/pricing";
import { type ImageSize } from "@/types/studio";
import { type SupabaseClient } from "@supabase/supabase-js";

/**
 * 해상도 기반 크레딧 비용 계산
 * @param imageSize 이미지 해상도 (1K, 2K, 4K)
 * @param count 생성 건수 (기본 1)
 */
export function getCreditCost(
  imageSize: ImageSize = "1K",
  count: number = 1,
): number {
  return CREDIT_COST[imageSize] * count;
}

export async function spendTokensForGeneration(
  supabase: SupabaseClient,
  userId: string | null,
  imageSize: ImageSize,
  count: number,
  description: string,
  historyId: string,
): Promise<{ spent: number }> {
  if (!userId) return { spent: 0 };

  const cost = getCreditCost(imageSize, count);

  const { error: spendError } = await supabase.rpc("spend_tokens", {
    p_user_id: userId,
    p_amount: cost,
    p_description: description,
    p_reference_id: historyId,
  });

  if (spendError) {
    if (spendError.message?.includes("TOKEN_INSUFFICIENT")) {
      throw new TokenInsufficientError();
    }
    console.error("Token spend error:", spendError);
  }

  return { spent: cost };
}

export async function checkFreeTrialLimit(
  supabase: SupabaseClient,
  userId: string | null,
  sessionId: string,
): Promise<boolean> {
  if (userId) {
    // 로그인 사용자: 토큰 잔액으로 관리
    return true;
  }

  // 비로그인: 무료 체험 한도 체크
  const { count } = await supabase
    .from("studio_history")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .is("user_id", null);

  return (count ?? 0) < FREE_TRIAL_TOKENS;
}

export class TokenInsufficientError extends Error {
  constructor() {
    super("토큰이 부족합니다. 토큰을 충전해주세요.");
    this.name = "TokenInsufficientError";
  }
}
