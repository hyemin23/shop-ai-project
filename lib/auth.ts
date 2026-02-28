import { createClient } from "@/lib/supabase/server";
import { getSessionId } from "@/lib/session";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserOrSessionId(): Promise<{
  userId: string | null;
  sessionId: string;
}> {
  const user = await getCurrentUser();
  const sessionId = await getSessionId();
  return {
    userId: user?.id ?? null,
    sessionId,
  };
}
