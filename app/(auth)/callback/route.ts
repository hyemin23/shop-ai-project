import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 세션 ID → 유저 연결 (비로그인 기록 마이그레이션)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("ddokpick-session-id")?.value;

        if (sessionId) {
          const serviceClient = createServiceClient();
          await serviceClient.rpc("link_session_to_user", {
            p_session_id: sessionId,
            p_user_id: user.id,
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
