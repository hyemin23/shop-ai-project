import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

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
    const search = searchParams.get("search")?.trim();
    const limit = Math.min(Number(searchParams.get("limit") || 20), 100);
    const offset = Number(searchParams.get("offset") || 0);

    let query = supabase
      .from("profiles")
      .select(
        "id, email, display_name, avatar_url, token_balance, free_tokens_used, is_master, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,display_name.ilike.%${search}%`,
      );
    }

    const { data: users, count, error } = await query;

    if (error) {
      console.error("Admin users query error:", error);
      return NextResponse.json(
        { error: "사용자 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      users: users ?? [],
      total: count ?? 0,
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
