"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { TOKEN_PACKAGES } from "@/config/pricing";
import { type TokenPackage } from "@/types/payment";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Check, Loader2, CreditCard, History } from "lucide-react";
import { toast } from "sonner";
import { TokenTransactionList } from "@/components/dashboard/token-transaction-list";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR").format(price);
}

export default function TokensPage() {
  return (
    <Suspense>
      <TokensContent />
    </Suspense>
  );
}

function TokensContent() {
  const { user } = useAuth();
  const { balance, isLoading: balanceLoading, refresh } = useTokenBalance();
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(
    null,
  );
  const [isPaying, setIsPaying] = useState(false);

  async function handlePurchase(pkg: TokenPackage) {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    setSelectedPackage(pkg);
    setIsPaying(true);

    try {
      // 토스 위젯 로드 (클라이언트 키 필요)
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        toast.error(
          "결제 시스템이 설정되지 않았습니다. 관리자에게 문의해주세요.",
        );
        setIsPaying(false);
        return;
      }

      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: user.id });

      const orderId = `order_${Date.now()}_${pkg.id}`;

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: pkg.price },
        orderId,
        orderName: `똑픽 ${pkg.name} 패키지 (${pkg.tokens}토큰)`,
        successUrl: `${window.location.origin}/dashboard/tokens?success=true&packageId=${pkg.id}`,
        failUrl: `${window.location.origin}/dashboard/tokens?success=false`,
        customerEmail: user.email ?? undefined,
        customerName:
          user.user_metadata?.name ?? user.email?.split("@")[0] ?? undefined,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("USER_CANCEL")) {
        toast.info("결제가 취소되었습니다.");
      } else {
        toast.error("결제 처리 중 오류가 발생했습니다.");
        console.error("Payment error:", error);
      }
    } finally {
      setIsPaying(false);
      setSelectedPackage(null);
    }
  }

  // 결제 성공 후 confirm 처리
  const searchParams = useSearchParams();
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (confirmedRef.current) return;
    if (searchParams.get("success") !== "true") return;

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const packageId = searchParams.get("packageId");

    if (!paymentKey || !orderId || !amount || !packageId) return;

    confirmedRef.current = true;
    window.history.replaceState({}, "", "/dashboard/tokens");

    fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
        packageId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success(
            `${data.charged} 토큰이 충전되었습니다! (잔액: ${data.balance})`,
          );
          refresh();
        } else {
          toast.error(data.error || "결제 확인에 실패했습니다.");
        }
      })
      .catch(() => toast.error("결제 확인 중 오류가 발생했습니다."));
  }, [searchParams, refresh]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">토큰 충전</h1>
        <p className="text-muted-foreground">
          토큰을 충전하여 AI 이미지 편집 서비스를 이용하세요.
        </p>
      </div>

      {/* 현재 잔액 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">현재 토큰 잔액</CardTitle>
          <Coins className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {balanceLoading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>{formatPrice(balance)} 토큰</>
            )}
          </div>
          {!user && (
            <p className="mt-2 text-sm text-muted-foreground">
              로그인 후 토큰을 충전할 수 있습니다.
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="packages">
        <TabsList>
          <TabsTrigger value="packages">
            <CreditCard className="mr-2 h-4 w-4" />
            패키지 선택
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            사용 내역
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            {TOKEN_PACKAGES.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative ${pkg.recommended ? "border-primary shadow-md" : ""}`}
              >
                {pkg.recommended && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    추천
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>
                    {formatPrice(pkg.tokens)} 토큰
                    {pkg.bonusTokens && (
                      <span className="text-primary">
                        {" "}
                        + {formatPrice(pkg.bonusTokens)} 보너스
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatPrice(pkg.price)}
                    <span className="text-base font-normal text-muted-foreground">
                      원
                    </span>
                  </div>
                  <Separator className="my-4" />
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      의류 교체 약{" "}
                      {Math.floor((pkg.tokens + (pkg.bonusTokens ?? 0)) / 10)}회
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      색상 변경 약{" "}
                      {Math.floor((pkg.tokens + (pkg.bonusTokens ?? 0)) / 8)}회
                    </li>
                    <li className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      유효기간 없음
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={pkg.recommended ? "default" : "outline"}
                    disabled={!user || isPaying}
                    onClick={() => handlePurchase(pkg)}
                  >
                    {isPaying && selectedPackage?.id === pkg.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    충전하기
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <TokenTransactionList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
