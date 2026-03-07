import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getUserOrSessionId } from "@/lib/auth";
import {
  type StudioType,
  type GenerationMode,
  type GeminiModel,
} from "@/types/studio";

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await getUserOrSessionId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "히스토리 ID가 필요합니다." },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // 소유자 검증 쿼리 빌드
    const query = supabase.from("studio_history").delete().eq("id", id).eq("user_id", userId);

    const { error } = await query;

    if (error) {
      console.error("History delete error:", error);
      return NextResponse.json(
        { error: "히스토리 삭제에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("History delete error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

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

    const type = searchParams.get("type") as StudioType | null;
    const sort = searchParams.get("sort") || "newest";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const cursor = searchParams.get("cursor"); // cursor-based pagination
    const offset = cursor ? 0 : parseInt(searchParams.get("offset") || "0");

    const supabase = createServiceClient();
    const ascending = sort === "oldest";

    let query = supabase
      .from("studio_history")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending })
      .limit(limit);

    if (type) {
      query = query.eq("type", type);
    }

    // cursor-based: use created_at as cursor for consistent performance
    if (cursor) {
      query = ascending
        ? query.gt("created_at", cursor)
        : query.lt("created_at", cursor);
    } else if (offset > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("History query error:", error);
      return NextResponse.json(
        { error: "히스토리 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (data || []).map((row: any) => ({
      id: row.id,
      sessionId: row.session_id,
      userId: row.user_id || undefined,
      createdAt: row.created_at,
      type: row.type as StudioType,
      mode: row.mode as GenerationMode,
      sourceImageUrl: row.source_image_url,
      resultImageUrl: row.result_image_url,
      sourceThumbUrl: row.source_thumb_url || undefined,
      resultThumbUrl: row.result_thumb_url || undefined,
      params: row.params,
      modelUsed: row.model_used as GeminiModel,
      fallbackUsed: row.fallback_used,
      processingTime: row.processing_time,
      batchId: row.batch_id || undefined,
    }));

    // Provide cursor for next page (last item's created_at)
    const nextCursor = items.length > 0 ? items[items.length - 1].createdAt : null;
    const response = NextResponse.json({ items, total: count ?? 0, nextCursor });
    response.headers.set(
      "Cache-Control",
      "private, max-age=30, stale-while-revalidate=60",
    );
    return response;
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
