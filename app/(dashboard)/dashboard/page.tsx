"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardConfig } from "@/config/dashboard";

const featureCardStyles: Record<string, { badge: string; gradient: string; iconBg: string; iconColor: string }> = {
  "/dashboard/studio": { badge: "Virtual Try-On", gradient: "from-violet-500 to-indigo-600", iconBg: "bg-violet-100 dark:bg-violet-500/20", iconColor: "text-violet-600 dark:text-violet-400" },
  "/dashboard/studio/color-swap": { badge: "Color Swap", gradient: "from-rose-500 to-orange-500", iconBg: "bg-rose-100 dark:bg-rose-500/20", iconColor: "text-rose-600 dark:text-rose-400" },
  "/dashboard/studio/pose-transfer": { badge: "Pose Transfer", gradient: "from-emerald-500 to-teal-500", iconBg: "bg-emerald-100 dark:bg-emerald-500/20", iconColor: "text-emerald-600 dark:text-emerald-400" },
  "/dashboard/video/motion-control": { badge: "Motion Control", gradient: "from-cyan-500 to-blue-600", iconBg: "bg-cyan-100 dark:bg-cyan-500/20", iconColor: "text-cyan-600 dark:text-cyan-400" },
  "/dashboard/video/product-showcase": { badge: "Product Showcase", gradient: "from-amber-500 to-orange-500", iconBg: "bg-amber-100 dark:bg-amber-500/20", iconColor: "text-amber-600 dark:text-amber-400" },
  "/dashboard/video/lip-sync": { badge: "Lip Sync", gradient: "from-pink-500 to-rose-500", iconBg: "bg-pink-100 dark:bg-pink-500/20", iconColor: "text-pink-600 dark:text-pink-400" },
};

const studioGroup = dashboardConfig.sidebarNavGroups.find((g) => g.title === "AI 스튜디오");
const videoGroup = dashboardConfig.sidebarNavGroups.find((g) => g.title === "AI 비디오");

const studioFeatures = studioGroup?.items.filter((item) => featureCardStyles[item.href]) ?? [];
const videoFeatures = videoGroup?.items.filter((item) => featureCardStyles[item.href]) ?? [];

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 6) return { text: "늦은 밤이에요", emoji: "🌙" };
  if (hour < 12) return { text: "좋은 아침이에요", emoji: "☀️" };
  if (hour < 18) return { text: "좋은 오후예요", emoji: "🌤️" };
  return { text: "좋은 저녁이에요", emoji: "🌆" };
}

const TYPEWRITER_PHRASES = [
  "촬영 없이 만드는 상품 이미지",
  "AI로 색상을 자유롭게 변경",
  "클릭 한 번으로 포즈 전환",
  "수 분 이내에 피팅 사진 완성",
  "배경을 원하는 장면으로 교체",
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
        // 타이핑 완료 후 잠시 대기
        setTimeout(() => setIsDeleting(true), 1800);
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
    const speed = isDeleting ? 40 : 80;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting]);

  return (
    <span className="inline-flex items-baseline">
      <span className="text-gradient font-semibold">
        {currentPhrase.slice(0, charIdx)}
      </span>
      <span className="ml-[1px] inline-block w-[2px] h-[1.1em] bg-primary animate-pulse" />
    </span>
  );
}

function FeatureCard({ item, index }: { item: (typeof studioFeatures)[number]; index: number }) {
  const style = featureCardStyles[item.href];
  if (!style) return null;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card opacity-0 animate-fade-in-up select-none"
      style={{ animationDelay: `${index * 80 + 200}ms` }}
    >
      {/* Animated gradient bar */}
      <div className="relative h-1 w-full overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-r ${style.gradient}`}
          style={{
            backgroundSize: "200% 100%",
            animation: "gradient-shift 4s ease-in-out infinite",
            animationDelay: `${index * 300}ms`,
          }}
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.iconBg} transition-all duration-500 group-hover:scale-110 group-hover:shadow-md`}
          >
            <item.icon className={`h-6 w-6 ${style.iconColor} transition-transform duration-500 group-hover:rotate-[-8deg]`} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold tracking-tight">{item.title}</h3>
            {/* Badge with shimmer */}
            <p className="relative inline-block text-xs font-medium text-muted-foreground overflow-hidden">
              <span className="relative z-10">{style.badge}</span>
              <span
                className="absolute inset-0 shimmer-bg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ animation: "shimmer 2s ease-in-out infinite" }}
              />
            </p>
          </div>
        </div>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>

        <div className="mt-6">
          <Button asChild className="w-full group/btn overflow-hidden relative">
            <Link href={item.href}>
              <span className="relative z-10 flex items-center justify-center gap-2">
                시작하기
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Hover glow */}
      <div
        className={`pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-r ${style.gradient}`}
        style={{ mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", padding: "1px", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor" }}
      />
    </div>
  );
}

function SectionHeader({
  title,
  description,
  delay = 0,
}: {
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <div
      className="opacity-0 animate-fade-in-up select-none"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-muted-foreground">{description}</p>
    </div>
  );
}

export default function DashboardPage() {
  const greeting = useMemo(() => getGreeting(), []);

  const videoBaseDelay = studioFeatures.length * 80 + 400;

  return (
    <div className="space-y-10">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6 sm:p-8 opacity-0 animate-fade-in-up grain select-none">
        {/* Decorative gradient background */}
        <div className="pointer-events-none absolute inset-0 gradient-mesh opacity-60" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-muted-foreground opacity-0 animate-scale-in"
              style={{ animationDelay: "100ms" }}
            >
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              AI 이미지 편집 플랫폼
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight opacity-0 animate-fade-in-up"
            style={{ animationDelay: "50ms" }}
          >
            <span className="text-gradient">{greeting.emoji} {greeting.text}</span>
          </h1>
          <p
            className="mt-2 text-muted-foreground max-w-lg opacity-0 animate-fade-in-up h-7"
            style={{ animationDelay: "150ms" }}
          >
            <TypewriterText phrases={TYPEWRITER_PHRASES} />
          </p>
        </div>
      </div>

      {/* Studio section */}
      <div className="space-y-5">
        <SectionHeader
          title="AI 스튜디오"
          description="의류 교체, 색상 변경, 포즈 전환 등 이미지 편집 기능"
          delay={150}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {studioFeatures.map((item, i) => (
            <FeatureCard key={item.href} item={item} index={i} />
          ))}
        </div>
      </div>

      {/* Video section */}
      {videoFeatures.length > 0 && (
        <div className="space-y-5">
          <SectionHeader
            title="AI 비디오"
            description="정적 이미지를 생동감 있는 영상으로 변환하세요"
            delay={videoBaseDelay}
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videoFeatures.map((item, i) => (
              <FeatureCard
                key={item.href}
                item={item}
                index={i + studioFeatures.length + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
