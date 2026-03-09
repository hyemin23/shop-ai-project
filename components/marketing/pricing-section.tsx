import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SUBSCRIPTION_PLANS,
  TOKEN_PACKAGES,
  FREE_TRIAL_TOKENS,
} from "@/config/pricing";

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price);
}

export function PricingSection() {
  return (
    <section id="pricing" className="relative border-t bg-muted/30">
      <div className="container mx-auto px-4 py-24 md:px-8 md:py-32">
        {/* Header */}
        <div className="mb-16 text-center select-none">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            필요한 만큼만
            <br className="hidden sm:block" />
            합리적으로
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            무료 {FREE_TRIAL_TOKENS} 크레딧으로 먼저 체험하고,
            <br className="hidden sm:block" />
            구독 또는 단건 충전으로 원하는 방식으로 이용하세요.
          </p>
        </div>

        {/* 무료 체험 배너 */}
        <div className="mx-auto mb-12 flex max-w-2xl items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">무료로 먼저 체험하세요</p>
              <p className="text-xs text-muted-foreground">
                가입 즉시 {FREE_TRIAL_TOKENS} 크레딧 제공 — 신용카드 불필요
              </p>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link href="/register">무료 시작</Link>
          </Button>
        </div>

        {/* 구독 플랜 */}
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold">월간 구독</h3>
          <p className="mt-1 text-sm text-muted-foreground">매월 자동 충전, 언제든 해지 가능</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border bg-card p-6 transition-all duration-200 hover:shadow-md ${
                plan.recommended
                  ? "border-primary shadow-md shadow-primary/10 ring-1 ring-primary"
                  : ""
              }`}
            >
              {plan.recommended && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3">
                  추천
                </Badge>
              )}

              <div className="mb-6">
                <h4 className="text-base font-bold">{plan.name}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">{formatPrice(plan.monthlyPrice)}</span>
                  <span className="text-sm text-muted-foreground">원/월</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  매월 {formatPrice(plan.monthlyTokens)} 크레딧
                </p>
              </div>

              <ul className="mb-6 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="w-full"
                variant={plan.recommended ? "default" : "outline"}
              >
                <Link href="/login">구독하기</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* 단건 충전 */}
        <div className="mt-16">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-semibold">단건 충전</h3>
            <p className="mt-1 text-sm text-muted-foreground">정기 구독 없이 필요할 때만</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {TOKEN_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-2xl border bg-card px-6 py-5 transition-all duration-200 hover:shadow-md ${
                  pkg.recommended ? "border-primary ring-1 ring-primary" : ""
                }`}
              >
                {pkg.recommended && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3">
                    인기
                  </Badge>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{pkg.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatPrice(pkg.tokens)} 크레딧
                      {pkg.bonusTokens ? ` + ${formatPrice(pkg.bonusTokens)} 보너스` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold">{formatPrice(pkg.price)}<span className="text-sm font-normal text-muted-foreground">원</span></p>
                  </div>
                </div>
                <Button asChild className="mt-4 w-full" variant="outline" size="sm">
                  <Link href="/login">충전하기</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* 크레딧 사용량 */}
        <div className="mt-12 rounded-2xl border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">크레딧 소모 기준</h3>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">이미지 생성</p>
              <div className="flex justify-between"><span>1K 해상도</span><span className="font-semibold">1 크레딧</span></div>
              <div className="flex justify-between"><span>2K 해상도</span><span className="font-semibold">2 크레딧</span></div>
              <div className="flex justify-between"><span>4K 해상도</span><span className="font-semibold">5 크레딧</span></div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">비디오 생성</p>
              <div className="flex justify-between"><span>5초 영상</span><span className="font-semibold">10 크레딧</span></div>
              <div className="flex justify-between"><span>10초 영상</span><span className="font-semibold">20 크레딧</span></div>
              <div className="flex justify-between"><span>상세페이지 빌더</span><span className="font-semibold">2 크레딧</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
