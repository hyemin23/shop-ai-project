import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { timingSafeEqual } from "node:crypto";

function verifyCronSecret(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !authHeader) return false;
  const expected = `Bearer ${secret}`;
  if (expected.length !== authHeader.length) return false;
  return timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(authHeader),
  );
}

export async function GET(request: Request) {
  if (!verifyCronSecret(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc("cleanup_old_history");

    if (error) {
      console.error("Cleanup error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Cleanup result:", data);
    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error("Cron cleanup error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
