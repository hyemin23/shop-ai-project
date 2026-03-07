import { SignJWT } from "jose";
import { withRetry, isTransientError } from "@/lib/retry";
import type {
  KlingApiRequest,
  KlingApiResponse,
  KlingImageToVideoApiRequest,
} from "@/types/video";

const KLING_BASE_URL = "https://api-singapore.klingai.com";

// JWT token cache (valid for 30 min, refresh at 25 min)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function generateToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expiresAt > now + 300) {
    return cachedToken.token;
  }

  const accessKey = process.env.KLING_ACCESS_KEY;
  const secretKey = process.env.KLING_SECRET_KEY;

  if (!accessKey || !secretKey) {
    throw new Error("KLING_ACCESS_KEY and KLING_SECRET_KEY must be set");
  }

  const secret = new TextEncoder().encode(secretKey);

  const token = await new SignJWT({ iss: accessKey })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(now + 1800)
    .setNotBefore(now - 5)
    .sign(secret);

  cachedToken = { token, expiresAt: now + 1800 };
  return token;
}

async function klingFetch(
  path: string,
  options?: RequestInit,
): Promise<KlingApiResponse> {
  return withRetry(
    async () => {
      const token = await generateToken();

      const res = await fetch(`${KLING_BASE_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options?.headers,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        const error = new Error(`Kling API error (${res.status}): ${text}`);
        (error as unknown as { status: number }).status = res.status;
        throw error;
      }

      return res.json();
    },
    { maxRetries: 2, baseDelayMs: 2000, shouldRetry: isTransientError },
  );
}

export async function createTextToVideoTask(
  params: KlingApiRequest,
): Promise<KlingApiResponse> {
  return klingFetch("/v1/videos/text2video", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function queryTextToVideoTask(
  taskId: string,
): Promise<KlingApiResponse> {
  return klingFetch(`/v1/videos/text2video/${taskId}`);
}

export async function createImageToVideoTask(
  params: KlingImageToVideoApiRequest,
): Promise<KlingApiResponse> {
  return klingFetch("/v1/videos/image2video", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function queryImageToVideoTask(
  taskId: string,
): Promise<KlingApiResponse> {
  return klingFetch(`/v1/videos/image2video/${taskId}`);
}
