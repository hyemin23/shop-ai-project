import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getUserOrSessionId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getUserOrSessionId();
    const { searchParams } = new URL(request.url);

    if (!userId) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const sort = searchParams.get("sort") || "newest";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = createServiceClient();
    const ascending = sort === "oldest";

    let query = supabase
      .from("generation_log")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("service_type", "video")
      .eq("status", "succeed")
      .order("created_at", { ascending })
      .limit(limit);

    if (offset > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("Video history query error:", error);
      return NextResponse.json(
        { error: "비디오 히스토리 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (data || []).map((row: any) => ({
      id: row.id,
      action: row.action,
      videoUrl: row.reference_id || null,
      sourceImageUrl: row.params?.imageUrl || null,
      prompt: row.params?.prompt || null,
      duration: row.params?.duration || null,
      mode: row.params?.mode || null,
      tokensCharged: row.tokens_charged,
      createdAt: row.created_at,
      completedAt: row.completed_at,
    }));

    const response = NextResponse.json({ items, total: count ?? 0 });
    response.headers.set(
      "Cache-Control",
      "private, max-age=30, stale-while-revalidate=60",
    );
    return response;
  } catch (error) {
    console.error("Video history error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
