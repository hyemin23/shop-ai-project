/**
 * SSRF(Server-Side Request Forgery) 방어 유틸리티
 *
 * 외부 URL을 서버에서 fetch하기 전에 반드시 validateUrl()로 검증하세요.
 */

import { StudioError } from "@/lib/errors";

/** 허용된 외부 도메인 (필요 시 추가) */
const ALLOWED_HOSTS = new Set([
  "qnxhvnvnszfvutoyftvi.supabase.co", // Supabase Storage
]);

/** 내부 네트워크로 연결되는 IP 대역 차단 */
const BLOCKED_IP_PATTERNS = [
  /^127\./,           // loopback
  /^10\./,            // RFC 1918
  /^172\.(1[6-9]|2\d|3[01])\./,  // RFC 1918
  /^192\.168\./,      // RFC 1918
  /^169\.254\./,      // link-local (AWS 메타데이터 등)
  /^::1$/,            // IPv6 loopback
  /^fc00:/,           // IPv6 ULA
  /^fe80:/,           // IPv6 link-local
  /^0\./,             // "this" network
  /^0\.0\.0\.0$/,
];

function isBlockedIp(hostname: string): boolean {
  return BLOCKED_IP_PATTERNS.some((pattern) => pattern.test(hostname));
}

/**
 * 외부 URL 검증 — SSRF 방어
 * @throws StudioError URL이 허용 목록에 없거나 내부 네트워크를 가리키면 예외
 */
export function validateExternalUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("유효하지 않은 URL입니다.");
  }

  // HTTPS만 허용
  if (parsed.protocol !== "https:") {
    throw new Error("HTTPS URL만 허용됩니다.");
  }

  // 허용 호스트 화이트리스트
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error(`허용되지 않은 호스트입니다: ${parsed.hostname}`);
  }

  // IP 주소 직접 지정 차단
  if (isBlockedIp(parsed.hostname)) {
    throw new Error("내부 네트워크 주소는 사용할 수 없습니다.");
  }

  return parsed;
}

/**
 * 검증된 URL로 fetch — 리다이렉트 차단 포함
 */
export async function safeFetch(
  rawUrl: string,
  options?: RequestInit,
): Promise<Response> {
  const validated = validateExternalUrl(rawUrl);

  const response = await fetch(validated.toString(), {
    ...options,
    redirect: "error", // 리다이렉트를 통한 우회 차단
  });

  return response;
}
