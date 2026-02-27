import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "ddokpick-session-id";

export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE_NAME);

  if (existing?.value) {
    return existing.value;
  }

  const newId = crypto.randomUUID();
  try {
    cookieStore.set(SESSION_COOKIE_NAME, newId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  } catch {
    // Server Component에서 호출 시 무시
  }

  return newId;
}

export function getSessionIdFromHeader(headers: Headers): string | null {
  return headers.get("x-session-id");
}
