import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
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

export async function checkBetaUser(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("is_beta")
    .eq("id", userId)
    .single();
  return data?.is_beta ?? false;
}
