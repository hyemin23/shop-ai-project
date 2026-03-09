"use client";

import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ServiceBreakdown } from "@/hooks/use-admin-chart-stats";

const SERVICE_LABELS: Record<string, string> = {
  studio: "스튜디오",
  video: "비디오",
  "detail-page": "상세페이지",
  unknown: "기타",
};

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ServiceBreakdownChart({
  data,
  isLoading,
}: {
  data: ServiceBreakdown[];
  isLoading: boolean;
}) {
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);

  const chartData = data.map((item, i) => ({
    service: item.service,
    label: SERVICE_LABELS[item.service] ?? item.service,
    count: item.count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const chartConfig = Object.fromEntries(
    chartData.map((item) => [
      item.service,
      { label: item.label, color: item.fill },
    ]),
  ) satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">서비스 유형별 비율</CardTitle>
        <CardDescription>
          최근 30일 | 총 {totalCount.toLocaleString("ko-KR")}건
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            데이터가 없습니다
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto h-[250px] w-full">
            <PieChart accessibilityLayer>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="service"
                innerRadius={50}
                outerRadius={80}
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent nameKey="service" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
