import { type Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import {
  TOKEN_PACKAGES,
  SUBSCRIPTION_PLANS,
  CREDIT_COST,
  VIDEO_CREDIT_COST,
  FREE_TRIAL_TOKENS,
} from "@/config/pricing";

export const metadata: Metadata = {
  title: "가격 안내",
  description:
    "똑픽 AI 이미지 편집 서비스의 요금제를 확인하세요. 무료 체험부터 프로 구독까지.",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price);
}

export default function PricingPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          합리적인 가격으로 시작하세요
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          무료 {FREE_TRIAL_TOKENS} 크레딧으로 체험하고, 필요한 만큼 충전하세요.
        </p>
      </div>

      {/* 구독 플랜 */}
      <section className="mt-16">
        <h2 className="text-center text-xl font-semibold">월간 구독</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          매월 자동 충전으로 편리하게 이용하세요
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={
                plan.recommended
                  ? "relative border-primary shadow-md"
                  : undefined
              }
            >
              {plan.recommended && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  추천
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">
                    {formatPrice(plan.monthlyPrice)}
                  </span>
                  <span className="text-sm text-muted-foreground">원/월</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.recommended ? "default" : "outline"}
                >
                  <Link href="/dashboard/subscription">구독하기</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* 단건 충전 */}
      <section className="mt-20">
        <h2 className="text-center text-xl font-semibold">단건 충전</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          필요할 때 원하는 만큼 충전하세요
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {TOKEN_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={
                pkg.recommended
                  ? "relative border-primary shadow-md"
                  : undefined
              }
            >
              {pkg.recommended && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  인기
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">
                    {formatPrice(pkg.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">원</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatPrice(pkg.tokens)} 크레딧
                  {pkg.bonusTokens
                    ? ` + ${formatPrice(pkg.bonusTokens)} 보너스`
                    : ""}
                </p>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/dashboard/tokens">충전하기</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* 크레딧 사용량 안내 */}
      <section className="mt-20">
        <h2 className="text-center text-xl font-semibold">
          크레딧 사용량 안내
        </h2>
        <div className="mx-auto mt-8 max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-medium">이미지 생성</h3>
                  <div className="mt-2 space-y-1.5 text-muted-foreground">
                    {Object.entries(CREDIT_COST).map(([size, cost]) => (
                      <div key={size} className="flex justify-between">
                        <span>{size} 해상도</span>
                        <span className="font-medium text-foreground">
                          {cost} 크레딧
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-medium">비디오 생성</h3>
                  <div className="mt-2 space-y-1.5 text-muted-foreground">
                    {Object.entries(VIDEO_CREDIT_COST).map(
                      ([duration, cost]) => (
                        <div key={duration} className="flex justify-between">
                          <span>{duration}초</span>
                          <span className="font-medium text-foreground">
                            {cost} 크레딧
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 text-center">
        <p className="text-lg font-medium">
          무료 {FREE_TRIAL_TOKENS} 크레딧으로 지금 바로 시작하세요
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/register">무료로 시작하기</Link>
        </Button>
      </section>
    </div>
  );
}
