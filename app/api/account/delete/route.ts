import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const serviceClient = createServiceClient();

    // 1) 활성 구독이 있으면 billing_key 정보 조회 (구독 취소 처리)
    const { data: activeSubscription } = await serviceClient
      .from("subscriptions")
      .select("id, billing_key")
      .eq("user_id", user.id)
      .in("status", ["active", "past_due"])
      .limit(1)
      .single();

    if (activeSubscription) {
      // 구독 상태를 canceled로 변경
      await serviceClient
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("id", activeSubscription.id);
    }

    // 2) Storage에서 유저 파일 삭제 (studio-images 버킷)
    const { data: files } = await serviceClient.storage
      .from("studio-images")
      .list(user.id);

    if (files && files.length > 0) {
      const filePaths = files.map((f) => `${user.id}/${f.name}`);
      await serviceClient.storage.from("studio-images").remove(filePaths);
    }

    // 3) Supabase Auth에서 유저 삭제 (profiles, token_transactions, consent_records는 CASCADE로 자동 삭제)
    const { error: deleteError } =
      await serviceClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("User deletion failed:", deleteError);
      return NextResponse.json(
        { error: "계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "계정 삭제 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
