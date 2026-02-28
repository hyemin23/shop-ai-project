import { TOKEN_COST, FREE_TRIAL_TOKENS } from "@/config/pricing";
import { type StudioType, type GenerationMode } from "@/types/studio";
import { type SupabaseClient } from "@supabase/supabase-js";

type Resolution = "1024" | "2048" | "4096";

export function getTokenCost(
  type: StudioType,
  mode: GenerationMode,
  resolution: Resolution = "1024",
): number {
  const costs = TOKEN_COST[mode][type];
  return (costs as Record<string, number>)[resolution] ?? costs["1024"];
}

export function getImageResolution(width: number, height: number): Resolution {
  const maxDim = Math.max(width, height);
  if (maxDim > 2048) return "4096";
  if (maxDim > 1024) return "2048";
  return "1024";
}

export async function spendTokensForGeneration(
  supabase: SupabaseClient,
  userId: string | null,
  type: StudioType,
  mode: GenerationMode,
  actualMode: GenerationMode,
  historyId: string,
): Promise<{ spent: number; refunded: number }> {
  if (!userId) return { spent: 0, refunded: 0 };

  const requestedCost = getTokenCost(type, mode);
  const actualCost = getTokenCost(type, actualMode);

  // 토큰 차감
  const { error: spendError } = await supabase.rpc("spend_tokens", {
    p_user_id: userId,
    p_amount: actualCost,
    p_description: `${type} (${actualMode}) 이미지 생성`,
    p_reference_id: historyId,
  });

  if (spendError) {
    if (spendError.message?.includes("TOKEN_INSUFFICIENT")) {
      throw new TokenInsufficientError();
    }
    console.error("Token spend error:", spendError);
  }

  // Fallback 환불: premium 요청 → standard 실행 시 차액 환불
  let refunded = 0;
  if (mode === "premium" && actualMode === "standard" && requestedCost > actualCost) {
    const refundAmount = requestedCost - actualCost;
    await supabase.rpc("charge_tokens", {
      p_user_id: userId,
      p_amount: refundAmount,
      p_description: `${type} Fallback 환불 (premium→standard)`,
      p_reference_id: historyId,
    });
    refunded = refundAmount;
  }

  return { spent: actualCost, refunded };
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
