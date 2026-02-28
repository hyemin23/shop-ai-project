const TOSS_API_URL = "https://api.tosspayments.com/v1";

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
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new TossPaymentError(
      "MISSING_SECRET_KEY",
      "토스 시크릿 키가 설정되지 않았습니다.",
      500,
    );
  }

  const encoded = Buffer.from(`${secretKey}:`).toString("base64");

  const response = await fetch(`${TOSS_API_URL}/payments/confirm`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encoded}`,
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
