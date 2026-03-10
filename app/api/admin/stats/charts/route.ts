import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireMaster } from "@/lib/admin";

export async function GET() {
  try {
    const { error: authError } = await requireMaster();
    if (authError) return authError;

    const supabase = createServiceClient();

    // 30일 전 날짜
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // 최근 30일 로그 + 구독 + 유저 수 병렬 조회
    const [
      { data: logs, error },
      { data: topUsersRaw, error: topUsersError },
      { data: subscriptions },
      { count: totalUsers },
    ] = await Promise.all([
      supabase
        .from("generation_log")
        .select("created_at, service_type, tokens_charged, status, user_id")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true }),
      supabase
        .from("generation_log")
        .select("user_id, profiles!user_id(email, display_name)")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .not("user_id", "is", null),
      supabase
        .from("subscriptions")
        .select("plan_id, status, cancel_at_period_end, current_period_end"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true }),
    ]);

    if (error) {
      console.error("Chart stats query error:", error);
      return NextResponse.json(
        { error: "통계 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    if (topUsersError) {
      console.error("Top users query error:", topUsersError);
    }

    // 1) 일별 생성 건수
    const dailyMap = new Map<string, number>();
    // 2) 서비스 타입별 건수
    const serviceMap = new Map<string, number>();
    // 3) 일별 토큰 소비량
    const tokenMap = new Map<string, number>();

    // 30일치 날짜 초기화
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, 0);
      tokenMap.set(key, 0);
    }

    for (const log of logs ?? []) {
      const dateKey = log.created_at.slice(0, 10);

      // 일별 생성 건수
      dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + 1);

      // 서비스 타입
      const svc = log.service_type ?? "unknown";
      serviceMap.set(svc, (serviceMap.get(svc) ?? 0) + 1);

      // 일별 토큰 (성공 건만)
      if (log.status === "succeed" && log.tokens_charged) {
        tokenMap.set(dateKey, (tokenMap.get(dateKey) ?? 0) + log.tokens_charged);
      }
    }

    // 4) Summary stats (기간별 건수 + 상태별 건수)
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);

    let todayCount = 0;
    let weekCount = 0;
    const monthCount = (logs ?? []).length;
    let successCount = 0;
    let failedCount = 0;
    let refundedCount = 0;

    for (const log of logs ?? []) {
      const dateKey = log.created_at.slice(0, 10);
      if (dateKey === todayStr) todayCount++;
      if (dateKey >= weekAgoStr) weekCount++;
      if (log.status === "succeed") successCount++;
      else if (log.status === "failed") failedCount++;
      else if (log.status === "refunded") refundedCount++;
    }

    // 구독 현황 집계
    const subByPlan: Record<string, number> = {};
    let activeSubs = 0;
    let cancelingSubs = 0;
    let pastDueSubs = 0;
    for (const sub of subscriptions ?? []) {
      if (sub.status === "active") {
        activeSubs++;
        subByPlan[sub.plan_id] = (subByPlan[sub.plan_id] ?? 0) + 1;
        if (sub.cancel_at_period_end) cancelingSubs++;
      } else if (sub.status === "past_due") {
        pastDueSubs++;
      }
    }

    const subscriptionSummary = {
      totalUsers: totalUsers ?? 0,
      activeSubs,
      cancelingSubs,
      pastDueSubs,
      byPlan: subByPlan,
    };

    const summary = {
      todayCount,
      weekCount,
      monthCount,
      successCount,
      failedCount,
      refundedCount,
      studioCount: serviceMap.get("studio") ?? 0,
      videoCount: serviceMap.get("video") ?? 0,
    };

    const dailyGeneration = Array.from(dailyMap.entries()).map(
      ([date, count]) => ({ date, count }),
    );

    const serviceBreakdown = Array.from(serviceMap.entries()).map(
      ([service, count]) => ({ service, count }),
    );

    const dailyTokens = Array.from(tokenMap.entries()).map(
      ([date, tokens]) => ({ date, tokens }),
    );

    // 5) 유저별 사용량 TOP 10
    const userCountMap = new Map<
      string,
      { email: string; displayName: string; count: number }
    >();
    for (const row of topUsersRaw ?? []) {
      const uid = row.user_id as string;
      const existing = userCountMap.get(uid);
      if (existing) {
        existing.count += 1;
      } else {
        const p = row.profiles as { email?: string; display_name?: string } | null;
        userCountMap.set(uid, {
          email: p?.email ?? "알 수 없음",
          displayName: p?.display_name ?? "",
          count: 1,
        });
      }
    }
    const topUsers = Array.from(userCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      summary,
      subscriptionSummary,
      dailyGeneration,
      serviceBreakdown,
      dailyTokens,
      topUsers,
    });
  } catch (error) {
    console.error("Admin chart stats error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
