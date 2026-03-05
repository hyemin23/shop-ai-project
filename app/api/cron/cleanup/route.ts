import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
