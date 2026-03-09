"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { TopUser } from "@/hooks/use-admin-chart-stats";

export function TopUsersCard({
  data,
  isLoading,
}: {
  data: TopUser[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">유저별 사용량 TOP 10</CardTitle>
        <CardDescription>최근 30일 기준</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            데이터가 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((user, i) => (
              <div
                key={user.email}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
              >
                <span className="w-5 text-center text-sm font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {(user.displayName || user.email).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {user.displayName || user.email}
                  </p>
                  {user.displayName && (
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-semibold">
                  {user.count.toLocaleString("ko-KR")}건
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
