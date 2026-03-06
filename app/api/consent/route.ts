import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

const consentSchema = z.object({
  agreeTerms: z.literal(true),
  agreePrivacy: z.literal(true),
  agreeMarketing: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = consentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "필수 약관에 동의해야 합니다." },
        { status: 400 },
      );
    }

    const { agreeMarketing } = parsed.data;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = request.headers.get("user-agent") ?? null;
    const now = new Date().toISOString();

    const supabase = await createClient();

    // 동의 이력 기록 (법적 증빙)
    const records = [
      { user_id: user.id, consent_type: "terms", agreed: true, ip_address: ip, user_agent: userAgent },
      { user_id: user.id, consent_type: "privacy", agreed: true, ip_address: ip, user_agent: userAgent },
      { user_id: user.id, consent_type: "marketing", agreed: agreeMarketing, ip_address: ip, user_agent: userAgent },
    ];

    const { error: insertError } = await supabase
      .from("consent_records")
      .insert(records);

    if (insertError) {
      console.error("Consent record insert error:", insertError);
      return NextResponse.json(
        { error: "동의 기록 저장에 실패했습니다." },
        { status: 500 },
      );
    }

    // profiles 업데이트 (service client로 RLS 우회)
    const serviceClient = createServiceClient();
    const { error: updateError } = await serviceClient
      .from("profiles")
      .update({
        terms_agreed_at: now,
        marketing_agreed: agreeMarketing,
        updated_at: now,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile consent update error:", updateError);
      return NextResponse.json(
        { error: "프로필 업데이트에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Consent API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
