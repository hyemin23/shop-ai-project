"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Coins,
  Gift,
  CreditCard,
  FileText,
  ImageIcon,
  Video,
  Key,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  tokenBalance: number;
  freeTokensUsed: number;
  isMaster: boolean;
  isBeta: boolean;
  hasGeminiKey: boolean;
  createdAt: string;
}

interface Subscription {
  plan_id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_start: string;
  current_period_end: string;
}

interface RecentLog {
  id: string;
  service_type: string;
  status: string;
  tokens_charged: number;
  created_at: string;
  error_message: string | null;
}

interface DailyActivity {
  date: string;
  count: number;
  tokens: number;
  success: number;
  failed: number;
}

interface UserDetailData {
  profile: UserProfile;
  subscription: Subscription | null;
  recentLogs: RecentLog[];
  totalGenerations: number;
  dailyActivity: DailyActivity[];
  serviceUsage: Record<string, number>;
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PLAN_LABELS: Record<string, string> = {
  sub_lite: "Lite",
  sub_pro: "Pro",
  sub_max: "Max",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  succeed: { label: "성공", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  failed: { label: "실패", color: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
  refunded: { label: "환불", color: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  pending: { label: "대기", color: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
};

const SERVICE_LABELS: Record<string, string> = {
  studio: "스튜디오",
  video: "비디오",
};

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [data, setData] = useState<UserDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || "조회에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="col-span-2 h-64" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            사용자 목록
          </Link>
        </Button>
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          {error || "사용자를 찾을 수 없습니다."}
        </div>
      </div>
    );
  }

  const { profile, subscription, recentLogs, totalGenerations, dailyActivity, serviceUsage } = data;
  const thirtyDayTotal = dailyActivity.reduce((s, d) => s + d.count, 0);
  const thirtyDayTokens = dailyActivity.reduce((s, d) => s + d.tokens, 0);
  const thirtyDaySuccess = dailyActivity.reduce((s, d) => s + d.success, 0);
  const thirtyDayFailed = dailyActivity.reduce((s, d) => s + d.failed, 0);

  const chartConfig = {
    success: { label: "성공", color: "var(--chart-1)" },
    failed: { label: "실패", color: "var(--chart-5)" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.displayName || profile.email}
          </h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {profile.isMaster && (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              마스터
            </Badge>
          )}
          {profile.isBeta && (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              베타
            </Badge>
          )}
        </div>
      </div>

      {/* Profile + Subscription row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Profile card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">프로필 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="이메일" value={profile.email} />
            <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="가입일" value={formatDate(profile.createdAt)} />
            <InfoRow icon={<Coins className="h-3.5 w-3.5" />} label="토큰 잔액" value={`${fmt(profile.tokenBalance)} 토큰`} />
            <InfoRow icon={<Gift className="h-3.5 w-3.5" />} label="무료 토큰 사용" value={`${fmt(profile.freeTokensUsed)} 토큰`} />
            <InfoRow icon={<FileText className="h-3.5 w-3.5" />} label="총 생성 수" value={`${fmt(totalGenerations)}건`} />
            {profile.hasGeminiKey && (
              <InfoRow icon={<Key className="h-3.5 w-3.5" />} label="Gemini API 키" value="설정됨" />
            )}
          </CardContent>
        </Card>

        {/* Stats + Subscription */}
        <div className="space-y-4 lg:col-span-2">
          {/* 30-day summary */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="30일 생성" value={fmt(thirtyDayTotal)} sub="건" color="blue" />
            <StatCard label="30일 토큰" value={fmt(thirtyDayTokens)} sub="소비" color="violet" />
            <StatCard label="성공" value={fmt(thirtyDaySuccess)} sub="건" color="emerald" />
            <StatCard label="실패" value={fmt(thirtyDayFailed)} sub="건" color="rose" />
          </div>

          {/* Subscription info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">구독 정보</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="text-sm">
                    {PLAN_LABELS[subscription.plan_id] ?? subscription.plan_id}
                  </Badge>
                  <Badge
                    className={
                      subscription.status === "active"
                        ? "bg-emerald-500/10 text-emerald-700"
                        : "bg-rose-500/10 text-rose-700"
                    }
                  >
                    {subscription.status === "active" ? "활성" : subscription.status}
                  </Badge>
                  {subscription.cancel_at_period_end && (
                    <Badge className="bg-amber-500/10 text-amber-700">해지 예정</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(subscription.current_period_start)} ~{" "}
                    {formatDate(subscription.current_period_end)}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">구독 없음</p>
              )}
            </CardContent>
          </Card>

          {/* Service usage breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">서비스별 사용량 (30일)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(serviceUsage).map(([svc, count]) => (
                  <div
                    key={svc}
                    className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2"
                  >
                    {svc === "studio" ? (
                      <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                    ) : (
                      <Video className="h-3.5 w-3.5 text-indigo-500" />
                    )}
                    <span className="text-sm">
                      {SERVICE_LABELS[svc] ?? svc}{" "}
                      <span className="font-mono font-semibold">{fmt(count)}</span>건
                    </span>
                  </div>
                ))}
                {Object.keys(serviceUsage).length === 0 && (
                  <p className="text-sm text-muted-foreground">사용 이력 없음</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Daily activity chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            일별 생성 추이 (최근 30일)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={dailyActivity} barGap={0} barCategoryGap="20%">
              <XAxis
                dataKey="date"
                tickFormatter={(v: string) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={30} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="success" stackId="a" fill="var(--chart-1)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="failed" stackId="a" fill="var(--chart-5)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold">최근 생성 로그</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={`/dashboard/admin/logs?userId=${profile.id}&userLabel=${encodeURIComponent(profile.displayName || profile.email)}`}
            >
              전체 보기
              <FileText className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              생성 이력이 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => {
                const st = STATUS_LABELS[log.status] ?? STATUS_LABELS.pending;
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 rounded-lg border bg-muted/10 px-3 py-2"
                  >
                    <Badge variant="outline" className={`text-[10px] ${st.color}`}>
                      {st.label}
                    </Badge>
                    <span className="text-xs">
                      {SERVICE_LABELS[log.service_type] ?? log.service_type}
                    </span>
                    {log.tokens_charged > 0 && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {log.tokens_charged} 토큰
                      </span>
                    )}
                    {log.error_message && (
                      <span className="truncate text-xs text-rose-500" title={log.error_message}>
                        {log.error_message}
                      </span>
                    )}
                    <span className="ml-auto whitespace-nowrap text-[11px] text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="ml-auto text-sm font-medium">{value}</span>
    </div>
  );
}

const STAT_COLORS = {
  blue: "border-blue-500/20 bg-blue-500/5",
  violet: "border-violet-500/20 bg-violet-500/5",
  emerald: "border-emerald-500/20 bg-emerald-500/5",
  rose: "border-rose-500/20 bg-rose-500/5",
} as const;

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: keyof typeof STAT_COLORS;
}) {
  return (
    <div className={`rounded-lg border p-3 ${STAT_COLORS[color]}`}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}
