import { timingSafeEqual } from "node:crypto";

const TOSS_API_URL = "https://api.tosspayments.com/v1";

function getAuthHeader(): string {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new TossPaymentError(
      "MISSING_SECRET_KEY",
      "토스 시크릿 키가 설정되지 않았습니다.",
      500,
    );
  }
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

export class TossPaymentError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "TossPaymentError";
    this.code = code;
    this.status = status;
  }
}

interface TossConfirmResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt: string;
}

export async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
): Promise<TossConfirmResponse> {
  const response = await fetch(`${TOSS_API_URL}/payments/confirm`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new TossPaymentError(
      data.code || "UNKNOWN_ERROR",
      data.message || "결제 승인에 실패했습니다.",
      response.status,
    );
  }

  return data as TossConfirmResponse;
}

// --- 웹훅 검증 ---

/** 토스 웹훅 시크릿 검증 (토스 대시보드 → 개발 정보 → 웹훅 시크릿) */
export function verifyWebhookSecret(requestBody: { secret?: string }): boolean {
  const webhookSecret = process.env.TOSS_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // 프로덕션에서 미설정 시 모든 웹훅 거부
    if (process.env.NODE_ENV === "production") return false;
    // 개발 환경에서는 스킵
    return true;
  }
  const requestSecret = requestBody.secret ?? "";
  if (webhookSecret.length !== requestSecret.length) return false;
  // 타이밍 공격 방어
  const a = Buffer.from(webhookSecret);
  const b = Buffer.from(requestSecret);
  return timingSafeEqual(a, b);
}

/** paymentKey로 토스 결제 조회 — 실제 결제 존재 여부 확인 */
export async function getPayment(paymentKey: string): Promise<{ status: string; totalAmount: number; orderId: string } | null> {
  try {
    const response = await fetch(`${TOSS_API_URL}/payments/${encodeURIComponent(paymentKey)}`, {
      method: "GET",
      headers: { Authorization: getAuthHeader() },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// --- 빌링키(정기결제) API ---

interface TossBillingKeyResponse {
  mId: string;
  billingKey: string;
  customerKey: string;
  authenticatedAt: string;
  method: string;
  card: {
    issuerCode: string;
    acquirerCode: string;
    number: string;
    cardType: string;
    ownerType: string;
  } | null;
}

interface TossBillingPaymentResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt: string;
}

/** 토스 authKey + customerKey로 빌링키 발급 승인 */
export async function authorizeBillingKey(
  authKey: string,
  customerKey: string,
): Promise<TossBillingKeyResponse> {
  const response = await fetch(
    `${TOSS_API_URL}/billing/authorizations/issue`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ authKey, customerKey }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new TossPaymentError(
      data.code || "BILLING_AUTH_FAILED",
      data.message || "빌링키 발급에 실패했습니다.",
      response.status,
    );
  }

  return data as TossBillingKeyResponse;
}

/** 빌링키로 자동결제 실행 */
export async function requestBillingPayment(
  billingKey: string,
  amount: number,
  orderId: string,
  orderName: string,
  customerKey: string,
): Promise<TossBillingPaymentResponse> {
  const response = await fetch(`${TOSS_API_URL}/billing/${billingKey}`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerKey,
      amount,
      orderId,
      orderName,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new TossPaymentError(
      data.code || "BILLING_PAYMENT_FAILED",
      data.message || "자동결제에 실패했습니다.",
      response.status,
    );
  }

  return data as TossBillingPaymentResponse;
}
