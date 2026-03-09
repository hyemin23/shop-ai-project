"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck,
  Coins,
  CalendarDays,
  CalendarRange,
  Calendar,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Image,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useAdminStats } from "@/hooks/use-admin-stats";
import { useAdminChartStats } from "@/hooks/use-admin-chart-stats";
import { DailyGenerationChart } from "@/components/admin/daily-generation-chart";
import { ServiceBreakdownChart } from "@/components/admin/service-breakdown-chart";
import { TokenConsumptionChart } from "@/components/admin/token-consumption-chart";
import { TopUsersCard } from "@/components/admin/top-users-card";

function formatNumber(n: number) {
  return n.toLocaleString("ko-KR");
}

export default function AdminPage() {
  const { balance, refresh: refreshBalance } = useTokenBalance();
  const stats = useAdminStats();
  const chartStats = useAdminChartStats();

  const [masterAmount, setMasterAmount] = useState("");
  const [isMasterCharging, setIsMasterCharging] = useState(false);

  async function handleMasterCharge() {
    const amount = Number(masterAmount);
    if (!amount || amount < 1) {
      toast.error("충전할 토큰 수를 입력해주세요.");
      return;
    }

    setIsMasterCharging(true);
    try {
      const res = await fetch("/api/tokens/master-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          `${data.charged} 토큰이 충전되었습니다! (잔액: ${data.balance})`,
        );
        setMasterAmount("");
        refreshBalance();
      } else {
        toast.error(data.error || "충전에 실패했습니다.");
      }
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    } finally {
      setIsMasterCharging(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">관리자 대시보드</h1>
        <p className="text-muted-foreground">
          서비스 현황을 한눈에 확인합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="오늘 생성"
          value={stats.todayCount}
          icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
          isLoading={stats.isLoading}
        />
        <StatCard
          title="이번 주"
          value={stats.weekCount}
          icon={<CalendarRange className="h-4 w-4 text-muted-foreground" />}
          isLoading={stats.isLoading}
        />
        <StatCard
          title="이번 달"
          value={stats.monthCount}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          isLoading={stats.isLoading}
        />
        <StatCard
          title="토큰 잔액"
          value={balance}
          icon={<Coins className="h-4 w-4 text-muted-foreground" />}
          isLoading={stats.isLoading}
        />
      </div>

      {/* 상태/서비스 요약 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">상태별 현황</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  성공 {formatNumber(stats.successCount)}
                </Badge>
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                  <XCircle className="mr-1 h-3 w-3" />
                  실패 {formatNumber(stats.failedCount)}
                </Badge>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  <RotateCcw className="mr-1 h-3 w-3" />
                  환불 {formatNumber(stats.refundedCount)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">서비스별 현황</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-blue-300 text-blue-700 dark:text-blue-300"
                >
                  <Image className="mr-1 h-3 w-3" />
                  스튜디오 {formatNumber(stats.studioCount)}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-violet-300 text-violet-700 dark:text-violet-300"
                >
                  <Video className="mr-1 h-3 w-3" />
                  비디오 {formatNumber(stats.videoCount)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DailyGenerationChart
          data={chartStats.dailyGeneration}
          isLoading={chartStats.isLoading}
        />
        <ServiceBreakdownChart
          data={chartStats.serviceBreakdown}
          isLoading={chartStats.isLoading}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TokenConsumptionChart
          data={chartStats.dailyTokens}
          isLoading={chartStats.isLoading}
        />
        <TopUsersCard
          data={chartStats.topUsers}
          isLoading={chartStats.isLoading}
        />
      </div>

      {/* 마스터 충전 */}
      <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <ShieldCheck className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-base font-medium text-amber-700 dark:text-amber-400">
            토큰 직접 충전
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              max={100000}
              placeholder="충전할 토큰 수"
              value={masterAmount}
              onChange={(e) => setMasterAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleMasterCharge()}
              className="max-w-[200px]"
            />
            <Button
              onClick={handleMasterCharge}
              disabled={isMasterCharging || !masterAmount}
              variant="outline"
              className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-950"
            >
              {isMasterCharging ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Coins className="mr-2 h-4 w-4" />
              )}
              충전
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 로그 바로가기 */}
      <Button variant="outline" asChild>
        <Link href="/dashboard/admin/logs">
          생성 로그 전체 보기
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  isLoading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{formatNumber(value)}</div>
        )}
      </CardContent>
    </Card>
  );
}
