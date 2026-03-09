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

export interface AdminSummary {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  successCount: number;
  failedCount: number;
  refundedCount: number;
  studioCount: number;
  videoCount: number;
}

export interface SubscriptionSummary {
  totalUsers: number;
  activeSubs: number;
  cancelingSubs: number;
  pastDueSubs: number;
  byPlan: Record<string, number>;
}

export interface AdminChartStats {
  summary: AdminSummary;
  subscriptionSummary: SubscriptionSummary;
  dailyGeneration: DailyGeneration[];
  serviceBreakdown: ServiceBreakdown[];
  dailyTokens: DailyTokens[];
  topUsers: TopUser[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const DEFAULT_SUMMARY: AdminSummary = {
  todayCount: 0,
  weekCount: 0,
  monthCount: 0,
  successCount: 0,
  failedCount: 0,
  refundedCount: 0,
  studioCount: 0,
  videoCount: 0,
};

const DEFAULT_SUB_SUMMARY: SubscriptionSummary = {
  totalUsers: 0,
  activeSubs: 0,
  cancelingSubs: 0,
  pastDueSubs: 0,
  byPlan: {},
};

export function useAdminChartStats(): AdminChartStats {
  const [data, setData] = useState<{
    summary: AdminSummary;
    subscriptionSummary: SubscriptionSummary;
    dailyGeneration: DailyGeneration[];
    serviceBreakdown: ServiceBreakdown[];
    dailyTokens: DailyTokens[];
    topUsers: TopUser[];
  }>({
    summary: DEFAULT_SUMMARY,
    subscriptionSummary: DEFAULT_SUB_SUMMARY,
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
          summary: json.summary ?? DEFAULT_SUMMARY,
          subscriptionSummary: json.subscriptionSummary ?? DEFAULT_SUB_SUMMARY,
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

  return { ...data, isLoading, refresh: fetchCharts };
}
