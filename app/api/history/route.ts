import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getSessionId } from "@/lib/session";
import {
  type StudioHistoryItem,
  type StudioType,
  type GenerationMode,
  type GeminiModel,
} from "@/types/studio";

export async function GET(request: NextRequest) {
  try {
    const sessionId = await getSessionId();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") as StudioType | null;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = createServiceClient();

    let query = supabase
      .from("studio_history")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

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

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
