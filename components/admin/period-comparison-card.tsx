"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
} from "lucide-react";
import type { DailyGeneration, DailyTokens } from "@/hooks/use-admin-chart-stats";

function calcChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

export function PeriodComparisonCard({
  dailyGeneration,
  dailyTokens,
  isLoading,
}: {
  dailyGeneration: DailyGeneration[];
  dailyTokens: DailyTokens[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // 주간 비교 (이번 주 7일 vs 지난 주 7일)
  const genThisWeek = dailyGeneration.slice(-7).reduce((s, d) => s + d.count, 0);
  const genLastWeek = dailyGeneration.slice(-14, -7).reduce((s, d) => s + d.count, 0);
  const genChange = calcChange(genThisWeek, genLastWeek);

  const tokThisWeek = dailyTokens.slice(-7).reduce((s, d) => s + d.tokens, 0);
  const tokLastWeek = dailyTokens.slice(-14, -7).reduce((s, d) => s + d.tokens, 0);
  const tokChange = calcChange(tokThisWeek, tokLastWeek);

  // 일간 비교 (오늘 vs 어제)
  const genToday = dailyGeneration.at(-1)?.count ?? 0;
  const genYesterday = dailyGeneration.at(-2)?.count ?? 0;
  const genDayChange = calcChange(genToday, genYesterday);

  const rows = [
    { label: "오늘 vs 어제", current: genToday, previous: genYesterday, change: genDayChange, unit: "건" },
    { label: "이번 주 vs 지난 주", current: genThisWeek, previous: genLastWeek, change: genChange, unit: "건" },
    { label: "주간 토큰 소비", current: tokThisWeek, previous: tokLastWeek, change: tokChange, unit: "토큰" },
  ];

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent" />
      <CardHeader className="relative pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-sm font-semibold">기간별 비교</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5"
          >
            <div>
              <p className="text-[11px] text-muted-foreground">{row.label}</p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-mono text-lg font-bold">{fmt(row.current)}</span>
                <span className="text-[11px] text-muted-foreground">
                  {row.unit} (이전: {fmt(row.previous)})
                </span>
              </div>
            </div>
            <ChangeBadge value={row.change} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ChangeBadge({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-1 font-mono text-xs font-semibold text-muted-foreground">
        <Minus className="h-3 w-3" />
        0%
      </span>
    );
  }

  const isPositive = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 font-mono text-xs font-semibold ${
        isPositive
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
