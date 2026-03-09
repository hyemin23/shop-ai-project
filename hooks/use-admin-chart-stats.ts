"use client";

import { useState, useEffect, useCallback } from "react";

export interface DailyGeneration {
  date: string;
  count: number;
}

export interface ServiceBreakdown {
  service: string;
  count: number;
}

export interface DailyTokens {
  date: string;
  tokens: number;
}

export interface TopUser {
  email: string;
  displayName: string;
  count: number;
}

export interface AdminChartStats {
  dailyGeneration: DailyGeneration[];
  serviceBreakdown: ServiceBreakdown[];
  dailyTokens: DailyTokens[];
  topUsers: TopUser[];
  isLoading: boolean;
}

export function useAdminChartStats(): AdminChartStats {
  const [data, setData] = useState<{
    dailyGeneration: DailyGeneration[];
    serviceBreakdown: ServiceBreakdown[];
    dailyTokens: DailyTokens[];
    topUsers: TopUser[];
  }>({
    dailyGeneration: [],
    serviceBreakdown: [],
    dailyTokens: [],
    topUsers: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCharts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/stats/charts");
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setData({
          dailyGeneration: json.dailyGeneration,
          serviceBreakdown: json.serviceBreakdown,
          dailyTokens: json.dailyTokens,
          topUsers: json.topUsers ?? [],
        });
      }
    } catch {
      // 조용히 실패
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  return { ...data, isLoading };
}
