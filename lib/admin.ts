import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * 관리자 권한 검증 — 인증 + is_master 확인
 * 실패 시 적절한 에러 응답 반환, 성공 시 User 객체 반환
 */
export async function requireMaster(): Promise<
  | { user: User; error?: never }
  | { user?: never; error: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      error: NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      ),
    };
  }

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_master")
    .eq("id", user.id)
    .single();

  if (!profile?.is_master) {
    return {
      error: NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 },
      ),
    };
  }

  return { user };
}
