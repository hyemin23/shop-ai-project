import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getUserOrSessionId } from "@/lib/auth";
import {
  type StudioHistoryItem,
  type StudioType,
  type GenerationMode,
  type GeminiModel,
} from "@/types/studio";

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionId } = await getUserOrSessionId();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") as StudioType | null;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = createServiceClient();

    let query = supabase
      .from("studio_history")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // 로그인 사용자는 user_id로, 비로그인은 session_id로 조회
    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      query = query.eq("session_id", sessionId);
    }

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("History query error:", error);
      return NextResponse.json(
        { error: "히스토리 조회에 실패했습니다." },
        { status: 500 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: StudioHistoryItem[] = (data || []).map((row: any) => ({
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
    }));

    const response = NextResponse.json({ items, total: items.length });
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
