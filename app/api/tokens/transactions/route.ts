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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = createServiceClient();

    let query = supabase
      .from("token_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Token transactions query error:", error);
      return NextResponse.json(
        { error: "거래 내역 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      amount: row.amount,
      balance: row.balance,
      description: row.description,
      referenceId: row.reference_id || undefined,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error("Token transactions error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
