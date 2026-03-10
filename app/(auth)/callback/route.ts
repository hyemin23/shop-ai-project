import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

function sanitizeRedirect(next: string): string {
  // 상대경로만 허용, protocol-relative URL 차단
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirect(searchParams.get("next") ?? "/dashboard");

  // OAuth provider 에러 처리 (사용자 거부, provider 장애 등)
  const oauthError =
    searchParams.get("error_description") || searchParams.get("error");
  if (oauthError) {
    console.error("[Auth Callback] OAuth provider error:", oauthError);
    const url = new URL(`${origin}/login`);
    url.searchParams.set("error", oauthError);
    return NextResponse.redirect(url);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Auth Callback] Code exchange failed:", {
        message: error.message,
        status: error.status,
      });
      const url = new URL(`${origin}/login`);
      url.searchParams.set("error", "auth_callback_error");
      return NextResponse.redirect(url);
    }

    // 세션 ID → 유저 연결 (비로그인 기록 마이그레이션)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const serviceClient = createServiceClient();

      // 프로필 존재 확인 (트리거 실패 방어)
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("id, terms_agreed_at")
        .eq("id", user.id)
        .single();

      if (!profile) {
        const { error: profileError } = await serviceClient
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            display_name:
              user.user_metadata?.name ?? user.user_metadata?.full_name,
            avatar_url: user.user_metadata?.avatar_url,
          });
        if (profileError) {
          console.error(
            "[Auth Callback] Profile creation fallback failed:",
            profileError.message,
          );
        }
      }

      // 비로그인 세션 데이터 마이그레이션
      const cookieStore = await cookies();
      const sessionId = cookieStore.get("ddokpick-session-id")?.value;

      if (sessionId) {
        const { error: linkError } = await serviceClient.rpc(
          "link_session_to_user",
          {
            p_session_id: sessionId,
            p_user_id: user.id,
          },
        );
        if (linkError) {
          console.error(
            "[Auth Callback] Session link failed:",
            linkError.message,
          );
        }
      }

      // 약관 미동의 신규 유저 → 온보딩으로 리다이렉트
      if (!profile?.terms_agreed_at) {
        const onboardingUrl = new URL(`${origin}/onboarding`);
        onboardingUrl.searchParams.set("next", next);
        return NextResponse.redirect(onboardingUrl);
      }
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
