import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const supabase = createServiceClient();

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

    // 30일 전 날짜
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // 최근 30일 로그 전체 조회 (집계용)
    const [{ data: logs, error }, { data: topUsersRaw, error: topUsersError }] =
      await Promise.all([
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

    const dailyGeneration = Array.from(dailyMap.entries()).map(
      ([date, count]) => ({ date, count }),
    );

    const serviceBreakdown = Array.from(serviceMap.entries()).map(
      ([service, count]) => ({ service, count }),
    );

    const dailyTokens = Array.from(tokenMap.entries()).map(
      ([date, tokens]) => ({ date, tokens }),
    );

    // 4) 유저별 사용량 TOP 10
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
