import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { escapeSQLLike } from "@/lib/utils";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const serviceType = searchParams.get("serviceType");
    const from = searchParams.get("from");
    const userSearch = searchParams.get("userSearch");
    const userId = searchParams.get("userId");
    const limit = Math.min(Number(searchParams.get("limit") || 50), 200);
    const cursor = searchParams.get("cursor");
    const offset = cursor ? 0 : Number(searchParams.get("offset") || 0);

    let query = supabase
      .from("generation_log")
      .select("*, profiles!user_id(email, display_name)", {
        count: "estimated",
      })
      .order("created_at", { ascending: false })
      .limit(limit);

    // Cursor-based pagination for consistent performance with large datasets
    if (cursor) {
      query = query.lt("created_at", cursor);
    } else if (offset > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    if (status) query = query.eq("status", status);
    if (serviceType) query = query.eq("service_type", serviceType);

    // userId 직접 필터 (프로필 조인 검색보다 훨씬 빠름)
    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (from) {
      query = query.gte("created_at", from);
    } else if (!userId && !userSearch) {
      // 전체 조회 시 기본 7일 제한 (유저/검색 필터 있으면 제한 안함)
      const sevenDaysAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      query = query.gte("created_at", sevenDaysAgo);
    }

    if (userSearch) {
      const sanitized = escapeSQLLike(userSearch);
      const { data: matchedProfiles } = await supabase
        .from("profiles")
        .select("id")
        .or(`email.ilike.%${sanitized}%,display_name.ilike.%${sanitized}%`);

      const matchedIds = (matchedProfiles ?? []).map((p) => p.id);
      if (matchedIds.length === 0) {
        return NextResponse.json({ success: true, logs: [], total: 0 });
      }
      query = query.in("user_id", matchedIds);
    }

    const { data: logs, count, error } = await query;

    if (error) {
      console.error("Generation logs query error:", error);
      return NextResponse.json(
        { error: "로그 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    // reference_id로 studio_history 썸네일 조회
    const refIds = (logs ?? [])
      .map((l) => l.reference_id)
      .filter((id): id is string => !!id);

    const thumbMap: Record<string, { source: string | null; result: string | null }> = {};
    if (refIds.length > 0) {
      const { data: histories } = await supabase
        .from("studio_history")
        .select("id, source_thumb_url, result_thumb_url, source_image_url, result_image_url")
        .in("id", refIds);

      for (const h of histories ?? []) {
        thumbMap[h.id] = {
          source: h.source_thumb_url || h.source_image_url || null,
          result: h.result_thumb_url || h.result_image_url || null,
        };
      }
    }

    const enrichedLogs = (logs ?? []).map((log) => ({
      ...log,
      _thumbs: log.reference_id ? thumbMap[log.reference_id] ?? null : null,
    }));

    return NextResponse.json({
      success: true,
      logs: enrichedLogs,
      total: count ?? 0,
    });
  } catch (error) {
    console.error("Admin generation-logs error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
