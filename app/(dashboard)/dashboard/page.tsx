"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

// 카드 스타일이 정의된 항목만 표시
const studioFeatures = studioGroup?.items.filter((item) => featureCardStyles[item.href]) ?? [];
const videoFeatures = videoGroup?.items.filter((item) => featureCardStyles[item.href]) ?? [];

function FeatureCard({ item }: { item: (typeof studioFeatures)[number] }) {
  const style = featureCardStyles[item.href];
  if (!style) return null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className={`h-1 w-full bg-gradient-to-r ${style.gradient}`} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.iconBg} transition-transform duration-300 group-hover:scale-110`}
          >
            <item.icon className={`h-6 w-6 ${style.iconColor}`} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold tracking-tight">{item.title}</h3>
            <p className="text-xs font-medium text-muted-foreground">
              {style.badge}
            </p>
          </div>
        </div>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>

        <div className="mt-6">
          <Button asChild className="w-full group/btn">
            <Link href={item.href}>
              시작하기
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">스튜디오</h1>
        <p className="mt-1 text-muted-foreground">
          AI로 의류 이미지를 편집하세요. 촬영 없이 수 분 이내에 완성합니다.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {studioFeatures.map((item) => (
          <FeatureCard key={item.href} item={item} />
        ))}
      </div>

      {videoFeatures.length > 0 && (
        <>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI 비디오</h2>
            <p className="mt-1 text-muted-foreground">
              정적 이미지를 생동감 있는 영상으로 변환하세요.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videoFeatures.map((item) => (
              <FeatureCard key={item.href} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
