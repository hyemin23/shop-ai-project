"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { SUBSCRIPTION_PLANS } from "@/config/pricing";
import { type SubscriptionPlan } from "@/types/payment";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Check,
  Loader2,
  CreditCard,
  Crown,
  CalendarClock,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR").format(price);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SubscriptionPage() {
  return (
    <Suspense>
      <SubscriptionContent />
    </Suspense>
  );
}

function SubscriptionContent() {
  const { user } = useAuth();
  const { subscription, isLoading: subLoading, refresh: refreshSub, cancel } = useSubscription();
  const { refresh: refreshBalance } = useTokenBalance();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const currentPlan = subscription
    ? SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId)
    : null;

  // 빌링키 발급 성공 후 리다이렉트 처리
  const searchParams = useSearchParams();
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (confirmedRef.current) return;
    if (searchParams.get("success") !== "true") return;

    const authKey = searchParams.get("authKey");
    const customerKey = searchParams.get("customerKey");
    const planId = searchParams.get("planId");

    if (!authKey || !customerKey || !planId) return;

    confirmedRef.current = true;
    window.history.replaceState({}, "", "/dashboard/subscription");

    fetch("/api/subscription/authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authKey, customerKey, planId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success(
            `${data.plan.name} 구독이 시작되었습니다! ${data.charged} 크레딧이 충전되었습니다.`,
          );
          refreshSub();
          refreshBalance();
        } else {
          toast.error(data.error || "구독 시작에 실패했습니다.");
        }
      })
      .catch(() => toast.error("구독 처리 중 오류가 발생했습니다."));
  }, [searchParams, refreshSub, refreshBalance]);

  // 결제 실패 리다이렉트 처리
  useEffect(() => {
    if (searchParams.get("success") === "false") {
      window.history.replaceState({}, "", "/dashboard/subscription");
      toast.error("결제가 취소되었습니다.");
    }
  }, [searchParams]);

  async function handleSubscribe(plan: SubscriptionPlan) {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    setSelectedPlan(plan);
    setIsSubscribing(true);

    try {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        toast.error("결제 시스템이 설정되지 않았습니다.");
        setIsSubscribing(false);
        return;
      }

      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: user.id });

      await payment.requestBillingAuth({
        method: "CARD",
        successUrl: `${window.location.origin}/dashboard/subscription?success=true&planId=${plan.id}`,
        failUrl: `${window.location.origin}/dashboard/subscription?success=false`,
        customerEmail: user.email ?? undefined,
        customerName:
          user.user_metadata?.name ?? user.email?.split("@")[0] ?? undefined,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("USER_CANCEL")) {
        toast.info("결제가 취소되었습니다.");
      } else {
        toast.error("결제 처리 중 오류가 발생했습니다.");
        console.error("Billing auth error:", error);
      }
    } finally {
      setIsSubscribing(false);
      setSelectedPlan(null);
    }
  }

  async function handleCancel(immediate: boolean) {
    setIsCanceling(true);
    const success = await cancel(immediate);
    if (success) {
      toast.success(
        immediate
          ? "구독이 즉시 해지되었습니다."
          : "현재 구독 기간이 끝나면 자동으로 해지됩니다.",
      );
      refreshBalance();
    } else {
      toast.error("구독 해지에 실패했습니다.");
    }
    setIsCanceling(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">구독 관리</h1>
        <p className="text-muted-foreground">
          월간 구독으로 매달 크레딧을 받고 할인된 가격으로 이용하세요.
        </p>
      </div>

      {/* 현재 구독 상태 */}
      {subLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      ) : subscription && currentPlan ? (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">현재 구독</CardTitle>
              </div>
              <Badge
                variant={
                  subscription.status === "active" ? "default" :
                  subscription.status === "past_due" ? "destructive" : "secondary"
                }
              >
                {subscription.status === "active" && "활성"}
                {subscription.status === "past_due" && "결제 실패"}
                {subscription.status === "canceled" && "해지됨"}
                {subscription.status === "paused" && "일시정지"}
              </Badge>
            </div>
            <CardDescription>
              {currentPlan.name} 플랜 — 매월 {formatPrice(currentPlan.monthlyTokens)} 크레딧
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <span>
                다음 갱신일: {formatDate(subscription.currentPeriodEnd)}
              </span>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {formatDate(subscription.currentPeriodEnd)}에 구독이 종료됩니다.
                </span>
              </div>
            )}

            {subscription.status === "past_due" && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                <span>
                  결제 실패 {subscription.paymentFailedCount}회 — 카드를 확인해주세요.
                </span>
              </div>
            )}

            <div className="text-2xl font-bold">
              {formatPrice(currentPlan.monthlyPrice)}
              <span className="text-base font-normal text-muted-foreground">
                원/월
              </span>
            </div>
          </CardContent>
          <CardFooter>
            {!subscription.cancelAtPeriodEnd && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={isCanceling}>
                    {isCanceling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    구독 해지
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>구독을 해지하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      현재 구독 기간({formatDate(subscription.currentPeriodEnd)}
                      )까지는 서비스를 이용할 수 있습니다.
                      이후 자동 결제가 중단됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleCancel(false)}>
                      기간 만료 후 해지
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardFooter>
        </Card>
      ) : null}

      {/* 플랜 선택 카드 */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          {subscription ? "플랜 변경" : "구독 플랜 선택"}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrentPlan = subscription?.planId === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.recommended ? "border-primary shadow-md" : ""} ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
              >
                {plan.recommended && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    추천
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge variant="secondary" className="absolute -top-2.5 right-4">
                    현재 플랜
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatPrice(plan.monthlyPrice)}
                    <span className="text-base font-normal text-muted-foreground">
                      원/월
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    매월 {formatPrice(plan.monthlyTokens)} 크레딧
                  </p>
                  <Separator className="my-4" />
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.recommended ? "default" : "outline"}
                    disabled={!user || isSubscribing || isCurrentPlan}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {isSubscribing && selectedPlan?.id === plan.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    {isCurrentPlan ? "현재 플랜" : subscription ? "변경하기" : "구독하기"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 안내 사항 */}
      <Card>
        <CardContent className="pt-6">
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>구독 크레딧은 매월 잔액에 누적됩니다 (리셋 아님).</li>
            <li>구독 중에도 일회성 토큰 추가 구매가 가능합니다.</li>
            <li>구독 해지 시 현재 기간까지 서비스를 이용할 수 있습니다.</li>
            <li>결제 실패 3회 시 구독이 일시정지됩니다.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
