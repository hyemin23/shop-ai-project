import { SignJWT } from "jose";
import type {
  KlingApiRequest,
  KlingApiResponse,
  KlingImageToVideoApiRequest,
} from "@/types/video";

const KLING_BASE_URL = "https://api-singapore.klingai.com";

async function generateToken(): Promise<string> {
  const accessKey = process.env.KLING_ACCESS_KEY;
  const secretKey = process.env.KLING_SECRET_KEY;

  if (!accessKey || !secretKey) {
    throw new Error("KLING_ACCESS_KEY and KLING_SECRET_KEY must be set");
  }

  const now = Math.floor(Date.now() / 1000);
  const secret = new TextEncoder().encode(secretKey);

  return new SignJWT({ iss: accessKey })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(now + 1800)
    .setNotBefore(now - 5)
    .sign(secret);
}

async function klingFetch(
  path: string,
  options?: RequestInit,
): Promise<KlingApiResponse> {
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
    throw new Error(`Kling API error (${res.status}): ${text}`);
  }

  return res.json();
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
