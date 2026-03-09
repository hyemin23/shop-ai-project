import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

async function verifyMaster() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_master")
    .eq("id", user.id)
    .single();

  if (!profile?.is_master) return null;
  return user;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const master = await verifyMaster();
  if (!master) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { userId } = await params;
  const supabase = createServiceClient();

  // 유저 프로필 + 구독 + 최근 생성 로그 + 토큰 트랜잭션 요약 병렬 조회
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { data: profile },
    { data: subscription },
    { data: recentLogs },
    { data: dailyActivity },
    { count: totalGenerations },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, display_name, avatar_url, token_balance, free_tokens_used, is_master, is_beta, gemini_api_key, created_at")
      .eq("id", userId)
      .single(),
    supabase
      .from("subscriptions")
      .select("plan_id, status, cancel_at_period_end, current_period_start, current_period_end, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("generation_log")
      .select("id, service_type, status, tokens_charged, created_at, error_message")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("generation_log")
      .select("created_at, status, tokens_charged, service_type")
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true }),
    supabase
      .from("generation_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  if (!profile) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  // 30일 일별 활동 집계
  const dailyMap = new Map<string, { count: number; tokens: number; success: number; failed: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap.set(d.toISOString().slice(0, 10), { count: 0, tokens: 0, success: 0, failed: 0 });
  }
  for (const log of dailyActivity ?? []) {
    const key = log.created_at.slice(0, 10);
    const entry = dailyMap.get(key);
    if (entry) {
      entry.count++;
      if (log.status === "succeed") {
        entry.success++;
        entry.tokens += log.tokens_charged ?? 0;
      } else if (log.status === "failed") {
        entry.failed++;
      }
    }
  }

  // 서비스별 사용량
  const serviceUsage: Record<string, number> = {};
  for (const log of dailyActivity ?? []) {
    const svc = log.service_type ?? "unknown";
    serviceUsage[svc] = (serviceUsage[svc] ?? 0) + 1;
  }

  return NextResponse.json({
    success: true,
    profile: {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      tokenBalance: profile.token_balance,
      freeTokensUsed: profile.free_tokens_used,
      isMaster: profile.is_master,
      isBeta: profile.is_beta,
      hasGeminiKey: !!profile.gemini_api_key,
      createdAt: profile.created_at,
    },
    subscription: subscription ?? null,
    recentLogs: recentLogs ?? [],
    totalGenerations: totalGenerations ?? 0,
    dailyActivity: Array.from(dailyMap.entries()).map(([date, v]) => ({
      date,
      ...v,
    })),
    serviceUsage,
  });
}
