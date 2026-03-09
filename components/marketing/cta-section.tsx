import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FREE_TRIAL_TOKENS } from "@/config/pricing";

export function CtaSection() {
  return (
    <section className="border-t">
      <div className="container mx-auto px-4 py-24 md:px-8 md:py-32">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground md:px-16">
          {/* 배경 장식 */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

          <div className="relative">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">
              지금 바로 시작하세요
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              똑똑, 핏 나왔습니다
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-primary-foreground/80 sm:text-lg">
              무료 {FREE_TRIAL_TOKENS} 크레딧으로 지금 바로 체험하세요.
              <br className="hidden sm:block" />
              신용카드 없이, 5분 안에 첫 이미지가 완성됩니다.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="group px-8 font-semibold"
              >
                <Link href="/register">
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="px-8 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <Link href="#features">기능 살펴보기</Link>
              </Button>
            </div>

            <p className="mt-6 text-xs text-primary-foreground/50">
              가입 즉시 {FREE_TRIAL_TOKENS} 크레딧 지급 · 신용카드 불필요 · 언제든 해지 가능
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
