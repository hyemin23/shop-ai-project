"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CalendarDays,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ImageIcon,
  Video,
  Activity,
  TrendingUp,
  Users,
  RefreshCw,
  Zap,
  ScrollText,
} from "lucide-react";
import { useAdminChartStats } from "@/hooks/use-admin-chart-stats";
import { DailyGenerationChart } from "@/components/admin/daily-generation-chart";
import { ServiceBreakdownChart } from "@/components/admin/service-breakdown-chart";
import { TokenConsumptionChart } from "@/components/admin/token-consumption-chart";
import { TopUsersCard } from "@/components/admin/top-users-card";
import { NoticeManager } from "@/components/admin/notice-manager";
import { SubscriptionOverviewCard } from "@/components/admin/subscription-overview-card";
import { PeriodComparisonCard } from "@/components/admin/period-comparison-card";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

function pct(a: number, b: number) {
  if (b === 0) return 0;
  return Math.round((a / b) * 1000) / 10;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const chartStats = useAdminChartStats();
  const stats = chartStats.summary;

  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(300); // 5min

  // -- Derived metrics -------------------------------------------------------
  const totalRequests = stats.successCount + stats.failedCount;
  const successRate = totalRequests > 0 ? pct(stats.successCount, totalRequests) : 0;

  const trend = useMemo(() => {
    const d = chartStats.dailyGeneration;
    if (d.length < 14) return null;
    const recent = d.slice(-7).reduce((s, v) => s + v.count, 0);
    const prev = d.slice(-14, -7).reduce((s, v) => s + v.count, 0);
    if (prev === 0) return recent > 0 ? 100 : 0;
    return Math.round(((recent - prev) / prev) * 1000) / 10;
  }, [chartStats.dailyGeneration]);

  const avgDailyGen = useMemo(() => {
    const d = chartStats.dailyGeneration;
    if (d.length === 0) return 0;
    const last7 = d.slice(-7);
    return Math.round(last7.reduce((s, v) => s + v.count, 0) / last7.length);
  }, [chartStats.dailyGeneration]);

  // -- Auto refresh ----------------------------------------------------------
  const refreshAll = useCallback(async () => {
    await chartStats.refresh();
    setLastRefreshed(new Date());
    setCountdown(300);
  }, [chartStats]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          refreshAll();
          return 300;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshAll]);

  const isLoading = chartStats.isLoading;

  // -- Render ----------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* ===================== HEADER ===================== */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            ADMIN BOARD
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            서비스 운영 현황 &middot; 실시간 모니터링
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Service status pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            서비스 정상
          </div>

          {/* Refresh countdown */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8"
                onClick={() => refreshAll()}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="absolute -bottom-0.5 -right-0.5 font-mono text-[9px] text-muted-foreground">
                  {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">
                마지막 갱신: {lastRefreshed.toLocaleTimeString("ko-KR")}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* ===================== KEY METRICS ===================== */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Success Rate — hero metric */}
        <HeroMetric
          label="성공률"
          value={isLoading ? null : `${successRate}%`}
          sub={isLoading ? undefined : `${fmt(stats.successCount)} / ${fmt(totalRequests)}`}
          accent={
            successRate >= 85 ? "emerald" : successRate >= 70 ? "amber" : "rose"
          }
          icon={<Activity className="h-4 w-4" />}
        />

        {/* Today's count */}
        <HeroMetric
          label="오늘 생성"
          value={isLoading ? null : fmt(stats.todayCount)}
          sub={`일 평균 ${fmt(avgDailyGen)}건`}
          accent="blue"
          icon={<Zap className="h-4 w-4" />}
        />

        {/* Weekly count with trend */}
        <HeroMetric
          label="이번 주"
          value={isLoading ? null : fmt(stats.weekCount)}
          trend={trend}
          accent="violet"
          icon={<TrendingUp className="h-4 w-4" />}
        />

        {/* Monthly count */}
        <HeroMetric
          label="이번 달"
          value={isLoading ? null : fmt(stats.monthCount)}
          sub="월간 생성 건수"
          accent="amber"
          icon={<CalendarDays className="h-4 w-4" />}
        />
      </div>

      {/* ===================== STATUS RIBBON ===================== */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Status breakdown */}
        <Card className="overflow-hidden border-0 bg-muted/30">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              상태
            </span>
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              <>
                <StatusPill
                  icon={<CheckCircle2 className="h-3 w-3" />}
                  label="성공"
                  count={stats.successCount}
                  color="emerald"
                />
                <StatusPill
                  icon={<XCircle className="h-3 w-3" />}
                  label="실패"
                  count={stats.failedCount}
                  color="rose"
                />
                <StatusPill
                  icon={<RotateCcw className="h-3 w-3" />}
                  label="환불"
                  count={stats.refundedCount}
                  color="violet"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Service breakdown */}
        <Card className="overflow-hidden border-0 bg-muted/30">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              서비스
            </span>
            {isLoading ? (
              <Skeleton className="h-6 w-36" />
            ) : (
              <>
                <StatusPill
                  icon={<ImageIcon className="h-3 w-3" />}
                  label="스튜디오"
                  count={stats.studioCount}
                  color="blue"
                />
                <StatusPill
                  icon={<Video className="h-3 w-3" />}
                  label="비디오"
                  count={stats.videoCount}
                  color="indigo"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===================== CHARTS — ROW 1 ===================== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DailyGenerationChart
          data={chartStats.dailyGeneration}
          isLoading={chartStats.isLoading}
        />
        <TokenConsumptionChart
          data={chartStats.dailyTokens}
          isLoading={chartStats.isLoading}
        />
      </div>

      {/* ===================== CHARTS — ROW 2 ===================== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ServiceBreakdownChart
            data={chartStats.serviceBreakdown}
            isLoading={chartStats.isLoading}
          />
        </div>
        <div className="lg:col-span-3">
          <TopUsersCard
            data={chartStats.topUsers}
            isLoading={chartStats.isLoading}
          />
        </div>
      </div>

      {/* ===================== PERIOD COMPARISON + SUBSCRIPTION ===================== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PeriodComparisonCard
          dailyGeneration={chartStats.dailyGeneration}
          dailyTokens={chartStats.dailyTokens}
          isLoading={chartStats.isLoading}
        />
        <SubscriptionOverviewCard
          data={chartStats.subscriptionSummary}
          isLoading={chartStats.isLoading}
        />
      </div>

      {/* ===================== NOTICE MANAGER ===================== */}
      <NoticeManager />

      {/* ===================== QUICK NAV ===================== */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">빠른 이동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <QuickNavButton
              href="/dashboard/admin/logs"
              icon={<ScrollText className="h-4 w-4" />}
              label="생성 로그"
              description="전체 로그 조회/환불"
            />
            <QuickNavButton
              href="/dashboard/admin/users"
              icon={<Users className="h-4 w-4" />}
              label="사용자 관리"
              description="충전/베타 설정"
            />
          </div>
        </CardContent>
      </Card>

      {/* ===================== FOOTER META ===================== */}
      <div className="flex items-center justify-end border-t pt-4">
        <p className="text-xs text-muted-foreground">
          마지막 갱신: {lastRefreshed.toLocaleTimeString("ko-KR")}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const ACCENT_STYLES = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    ring: "ring-emerald-500/20",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    ring: "ring-blue-500/20",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
    ring: "ring-violet-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    ring: "ring-amber-500/20",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    ring: "ring-rose-500/20",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
    ring: "ring-indigo-500/20",
  },
} as const;

type Accent = keyof typeof ACCENT_STYLES;

function HeroMetric({
  label,
  value,
  sub,
  trend,
  accent,
  icon,
}: {
  label: string;
  value: string | null;
  sub?: string;
  trend?: number | null;
  accent: Accent;
  icon: React.ReactNode;
}) {
  const a = ACCENT_STYLES[accent];

  return (
    <Card className={`relative overflow-hidden ${a.border}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity hover:opacity-100" />
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <div className={`flex h-7 w-7 items-center justify-center rounded-md ${a.bg} ${a.text}`}>
            {icon}
          </div>
        </div>
        <div className="mt-3">
          {value === null ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <p className="font-mono text-3xl font-bold tracking-tight">
              {value}
            </p>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          {sub && (
            <span className="text-xs text-muted-foreground">{sub}</span>
          )}
          {trend !== null && trend !== undefined && (
            <TrendBadge value={trend} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TrendBadge({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[11px] font-semibold ${isPositive
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
        }`}
    >
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {Math.abs(value)}%
    </span>
  );
}

function StatusPill({
  icon,
  label,
  count,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: Accent;
}) {
  const a = ACCENT_STYLES[color];
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${a.border} ${a.bg}`}>
      <span className={a.text}>{icon}</span>
      <span className="text-xs font-medium">
        {label}{" "}
        <span className={`font-mono font-semibold ${a.text}`}>{fmt(count)}</span>
      </span>
    </div>
  );
}

function QuickNavButton({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <Button
      variant="outline"
      className="h-auto flex-col items-start gap-1 p-4 text-left"
      asChild
    >
      <Link href={href}>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">{label}</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <span className="text-xs text-muted-foreground">{description}</span>
      </Link>
    </Button>
  );
}
