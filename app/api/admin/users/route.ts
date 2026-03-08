import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
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
        "id, email, display_name, avatar_url, token_balance, free_tokens_used, is_master, is_beta, gemini_api_key, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      const sanitized = search.replace(/[%_\\]/g, "\\$&");
      query = query.or(
        `email.ilike.%${sanitized}%,display_name.ilike.%${sanitized}%`,
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

const patchSchema = z.object({
  userId: z.string().uuid(),
  isBeta: z.boolean(),
  geminiApiKey: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { userId, isBeta, geminiApiKey } = parsed.data;

    const updateData: Record<string, unknown> = {
      is_beta: isBeta,
      updated_at: new Date().toISOString(),
    };

    if (isBeta && geminiApiKey !== undefined) {
      updateData.gemini_api_key = geminiApiKey || null;
    }
    if (!isBeta) {
      updateData.gemini_api_key = null;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) {
      console.error("Admin user update error:", error);
      return NextResponse.json(
        { error: "사용자 권한 변경에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user patch error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
