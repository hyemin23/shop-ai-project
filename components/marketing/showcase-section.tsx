"use client";

import { useState } from "react";
import { Shirt, Palette, PersonStanding, Wallpaper, LayoutTemplate, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "try-on",     label: "의류 교체",      icon: Shirt },
  { key: "color",      label: "색상 변경",      icon: Palette },
  { key: "pose",       label: "포즈 변경",      icon: PersonStanding },
  { key: "background", label: "배경 변경",      icon: Wallpaper },
  { key: "detail",     label: "상세페이지",      icon: LayoutTemplate },
  { key: "video",      label: "AI 비디오",      icon: Video },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// 실제 이미지 추가 시 이 객체에 URL만 채우면 됩니다
const SHOWCASE: Record<TabKey, { before?: string; after?: string; label: string }> = {
  "try-on":     { label: "모델에 새 옷을 자동 합성" },
  "color":      { label: "원하는 컬러로 즉시 변경" },
  "pose":       { label: "다양한 포즈를 재촬영 없이" },
  "background": { label: "배경을 자유롭게 교체" },
  "detail":     { label: "AI가 상세페이지 섹션 자동 생성" },
  "video":      { label: "상품 사진이 영상이 됩니다" },
};

export function ShowcaseSection() {
  const [active, setActive] = useState<TabKey>("try-on");
  const item = SHOWCASE[active];

  return (
    <section className="border-t bg-muted/20">
      <div className="container mx-auto px-4 py-24 md:px-8 md:py-32">
        {/* Header */}
        <div className="mb-12 text-center select-none">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Results
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            직접 확인해보세요
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            똑핏이 만들어낸 결과물입니다.
            <br className="hidden sm:block" />
            촬영 없이, AI 하나로 이 모든 게 가능합니다.
          </p>
        </div>

        {/* 탭 */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                active === tab.key
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 이미지 영역 */}
        <div className="mx-auto max-w-4xl">
          {item.before && item.after ? (
            /* Before / After 나란히 */
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border bg-card">
                <div className="flex h-10 items-center border-b px-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Before</span>
                </div>
                <img src={item.before} alt="Before" className="w-full object-cover" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-primary/30 bg-card">
                <div className="flex h-10 items-center border-b border-primary/20 bg-primary/5 px-4">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">After — 똑핏</span>
                </div>
                <img src={item.after} alt="After" className="w-full object-cover" />
              </div>
            </div>
          ) : (
            /* 이미지 준비 중 플레이스홀더 */
            <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50">
              <div className="text-center select-none">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  {(() => {
                    const Tab = TABS.find((t) => t.key === active)!;
                    return <Tab.icon className="h-7 w-7 text-muted-foreground" />;
                  })()}
                </div>
                <p className="text-base font-semibold">{item.label}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  실제 결과 이미지가 곧 추가됩니다
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
