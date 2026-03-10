import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireMaster } from "@/lib/admin";

// GET: 활성 공지 조회 (일반 유저용) 또는 전체 목록 (관리자용)
export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const isAdmin = req.nextUrl.searchParams.get("all") === "true";

  if (isAdmin) {
    const result = await requireMaster();
    if (result.error) return result.error;

    const { data, error } = await supabase
      .from("system_notices")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, notices: data });
  }

  // 일반 유저: 현재 활성인 공지만
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("system_notices")
    .select("id, title, message, type, starts_at, ends_at")
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, notice: data?.[0] ?? null });
}

// POST: 공지 생성
export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireMaster();
  if (authError) return authError;

  const body = await req.json();
  const { title, message, type = "info", is_active = false, starts_at, ends_at } = body;

  if (!title || !message) {
    return NextResponse.json(
      { error: "제목과 내용은 필수입니다." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("system_notices")
    .insert({
      title,
      message,
      type,
      is_active,
      starts_at: starts_at || null,
      ends_at: ends_at || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, notice: data });
}

// PATCH: 공지 수정 (활성/비활성 토글 포함)
export async function PATCH(req: NextRequest) {
  const { error: authError } = await requireMaster();
  if (authError) return authError;

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "공지 ID가 필요합니다." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("system_notices")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, notice: data });
}

// DELETE: 공지 삭제
export async function DELETE(req: NextRequest) {
  const { error: authError } = await requireMaster();
  if (authError) return authError;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "공지 ID가 필요합니다." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("system_notices")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
