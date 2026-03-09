"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
import type { DailyTokens } from "@/hooks/use-admin-chart-stats";

const chartConfig = {
  tokens: {
    label: "토큰 소비량",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function TokenConsumptionChart({
  data,
  isLoading,
}: {
  data: DailyTokens[];
  isLoading: boolean;
}) {
  const totalTokens = data.reduce((sum, d) => sum + d.tokens, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">일별 토큰 소비</CardTitle>
        <CardDescription>
          최근 30일 | 총 {totalTokens.toLocaleString("ko-KR")} 토큰
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatDateLabel}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={formatDateLabel}
                  />
                }
              />
              <defs>
                <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-tokens)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-tokens)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                dataKey="tokens"
                type="monotone"
                fill="url(#tokenGradient)"
                stroke="var(--color-tokens)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
