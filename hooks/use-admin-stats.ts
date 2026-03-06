"use client";

import { useState, useEffect, useCallback } from "react";
import type { GenerationLogStatus, GenerationServiceType } from "@/types/video";

export interface AdminStats {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  successCount: number;
  failedCount: number;
  refundedCount: number;
  studioCount: number;
  videoCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

async function fetchCount(params: Record<string, string>): Promise<number> {
  const sp = new URLSearchParams({ limit: "1", ...params });
  const res = await fetch(`/api/admin/generation-logs?${sp}`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.total ?? 0;
}

function getDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function useAdminStats(): AdminStats {
  const [stats, setStats] = useState({
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
    successCount: 0,
    failedCount: 0,
    refundedCount: 0,
    studioCount: 0,
    videoCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [today, week, month, succeed, failed, refunded, studio, video] =
        await Promise.all([
          fetchCount({ from: getDateString(0) }),
          fetchCount({ from: getDateString(7) }),
          fetchCount({ from: getDateString(30) }),
          fetchCount({ status: "succeed" as GenerationLogStatus }),
          fetchCount({ status: "failed" as GenerationLogStatus }),
          fetchCount({ status: "refunded" as GenerationLogStatus }),
          fetchCount({ serviceType: "studio" as GenerationServiceType }),
          fetchCount({ serviceType: "video" as GenerationServiceType }),
        ]);

      setStats({
        todayCount: today,
        weekCount: week,
        monthCount: month,
        successCount: succeed,
        failedCount: failed,
        refundedCount: refunded,
        studioCount: studio,
        videoCount: video,
      });
    } catch {
      // 조용히 실패
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...stats, isLoading, refresh };
}
