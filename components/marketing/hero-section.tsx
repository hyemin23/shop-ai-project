"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shirt, Palette, PersonStanding } from "lucide-react";

const HERO_PHRASES = [
  "상품 이미지",
  "피팅 사진",
  "컬러 바리에이션",
  "포즈 변형",
  "상세페이지",
];

function TypewriterText({ phrases }: { phrases: string[] }) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPhrase = phrases[phraseIdx];

  const tick = useCallback(() => {
    if (!isDeleting) {
      if (charIdx < currentPhrase.length) {
        setCharIdx((prev) => prev + 1);
      } else {
        setTimeout(() => setIsDeleting(true), 2000);
        return;
      }
    } else {
      if (charIdx > 0) {
        setCharIdx((prev) => prev - 1);
      } else {
        setIsDeleting(false);
        setPhraseIdx((prev) => (prev + 1) % phrases.length);
        return;
      }
    }
  }, [charIdx, isDeleting, currentPhrase, phrases.length]);

  useEffect(() => {
    const speed = isDeleting ? 50 : 100;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting]);

  return (
    <span className="inline-flex items-baseline">
      <span className="text-gradient">{currentPhrase.slice(0, charIdx)}</span>
      <span className="ml-[1px] inline-block w-[3px] h-[0.85em] bg-primary rounded-full animate-pulse" />
    </span>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="gradient-mesh grain absolute inset-0" />

      {/* Decorative floating orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-20 left-[15%] h-72 w-72 rounded-full opacity-[0.07] blur-3xl animate-float"
          style={{ background: "oklch(0.545 0.215 262)" }}
        />
        <div
          className="absolute top-40 right-[10%] h-56 w-56 rounded-full opacity-[0.05] blur-3xl animate-float"
          style={{ background: "oklch(0.637 0.237 25)", animationDelay: "2s" }}
        />
        <div
          className="absolute -bottom-10 left-[40%] h-64 w-64 rounded-full opacity-[0.06] blur-3xl animate-float"
          style={{ background: "oklch(0.715 0.152 160)", animationDelay: "4s" }}
        />
      </div>

      <div className="container relative z-10 mx-auto flex flex-col items-center gap-8 px-4 pb-24 pt-20 text-center md:gap-10 md:pb-32 md:pt-28 select-none">
        {/* Animated badge */}
        <Badge
          variant="secondary"
          className="animate-fade-in-up rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          AI 의류 이미지 편집 서비스
        </Badge>

        {/* Headline with typewriter */}
        <div className="animate-fade-in-up space-y-4" style={{ animationDelay: "100ms" }}>
          <h1 className="max-w-4xl text-[2.5rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            촬영 없이 만드는
            <br />
            <TypewriterText phrases={HERO_PHRASES} />
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="animate-fade-in-up max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
          style={{ animationDelay: "200ms" }}
        >
          동대문 의류 셀러를 위한 AI 이미지 편집 서비스.
          <br className="hidden sm:block" />
          의류 교체, 색상 변경, 포즈 변경을
          <span className="font-semibold text-foreground"> 건당 1,000원 이하</span>,
          <span className="font-semibold text-foreground"> 수 분 이내</span>로.
        </p>

        {/* CTA buttons */}
        <div
          className="animate-fade-in-up flex flex-col gap-3 sm:flex-row"
          style={{ animationDelay: "300ms" }}
        >
          <Button size="lg" asChild className="group relative overflow-hidden px-8 hover:shadow-lg hover:shadow-primary/25">
            <Link href="/login">
              스튜디오 시작하기
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="px-8 backdrop-blur-sm">
            <a href="#features">기능 살펴보기</a>
          </Button>
        </div>

        {/* Feature pills */}
        <div
          className="animate-fade-in-up flex flex-wrap items-center justify-center gap-3 pt-4"
          style={{ animationDelay: "450ms" }}
        >
          {[
            { icon: Shirt, label: "의류 교체" },
            { icon: Palette, label: "색상 변경" },
            { icon: PersonStanding, label: "포즈 변경" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-full border bg-background/60 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/20 hover:text-foreground"
            >
              <item.icon className="h-4 w-4 text-primary/70" />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
