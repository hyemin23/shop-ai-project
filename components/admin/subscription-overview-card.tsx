"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CreditCard, AlertTriangle, XCircle } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/config/pricing";
import type { SubscriptionSummary } from "@/hooks/use-admin-chart-stats";

const PLAN_LABELS: Record<string, string> = {};
for (const p of SUBSCRIPTION_PLANS) {
  PLAN_LABELS[p.id] = p.name;
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

export function SubscriptionOverviewCard({
  data,
  isLoading,
}: {
  data: SubscriptionSummary;
  isLoading: boolean;
}) {
  const planEntries = SUBSCRIPTION_PLANS.map((p) => ({
    id: p.id,
    label: p.name,
    count: data.byPlan[p.id] ?? 0,
    price: p.monthlyPrice,
  }));

  const totalMRR = planEntries.reduce((s, p) => s + p.count * p.price, 0);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] to-transparent" />
      <CardHeader className="relative pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <CreditCard className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <CardTitle className="text-sm font-semibold">구독 현황</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat
                icon={<Users className="h-3.5 w-3.5" />}
                label="총 유저"
                value={fmt(data.totalUsers)}
                color="blue"
              />
              <MiniStat
                icon={<CreditCard className="h-3.5 w-3.5" />}
                label="활성 구독"
                value={fmt(data.activeSubs)}
                color="emerald"
              />
              <MiniStat
                icon={<XCircle className="h-3.5 w-3.5" />}
                label="해지 예정"
                value={fmt(data.cancelingSubs)}
                color="amber"
              />
              <MiniStat
                icon={<AlertTriangle className="h-3.5 w-3.5" />}
                label="결제 실패"
                value={fmt(data.pastDueSubs)}
                color="rose"
              />
            </div>

            {/* Plan breakdown */}
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                플랜별 구독자
              </p>
              <div className="space-y-2">
                {planEntries.map((p) => {
                  const ratio =
                    data.activeSubs > 0
                      ? (p.count / data.activeSubs) * 100
                      : 0;
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="w-10 text-xs font-semibold">
                        {p.label}
                      </span>
                      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-violet-500/60 transition-all"
                          style={{ width: `${Math.max(ratio, 0)}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-xs font-semibold">
                        {p.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MRR estimate */}
            <div className="flex items-center justify-between rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2">
              <span className="text-xs text-muted-foreground">예상 MRR</span>
              <span className="font-mono text-sm font-bold text-violet-600 dark:text-violet-400">
                {totalMRR > 0
                  ? `${fmt(totalMRR)}원`
                  : "—"}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

const MINI_STAT_COLORS = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
} as const;

function MiniStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: keyof typeof MINI_STAT_COLORS;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-background/50 p-2.5">
      <div className="flex items-center gap-1.5">
        <div
          className={`flex h-5 w-5 items-center justify-center rounded ${MINI_STAT_COLORS[color]}`}
        >
          {icon}
        </div>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <span className="font-mono text-lg font-bold leading-none">{value}</span>
    </div>
  );
}
