"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import type {
  GenerationLog,
  GenerationLogStatus,
  GenerationServiceType,
} from "@/types/video";

export interface AdminLogsFilter {
  status: GenerationLogStatus | "all";
  serviceType: GenerationServiceType | "all";
  from: string | null;
  userSearch: string | null;
  userId: string | null;
  userLabel: string | null;
}

export interface UseAdminLogsReturn {
  logs: GenerationLog[];
  total: number;
  isLoading: boolean;
  filter: AdminLogsFilter;
  setFilter: (f: Partial<AdminLogsFilter>) => void;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  totalPages: number;
  refund: (logId: string, reason?: string) => Promise<boolean>;
  isRefunding: boolean;
  refresh: () => Promise<void>;
}

const PAGE_SIZE = 20;

function getDefaultFrom(): string {
  const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

const DEFAULT_FILTER: AdminLogsFilter = {
  status: "all",
  serviceType: "all",
  from: getDefaultFrom(),
  userSearch: null,
  userId: null,
  userLabel: null,
};

// snake_case DB row → camelCase GenerationLog
function mapLogRow(row: Record<string, unknown>): GenerationLog {
  const profile = row.profiles as Record<string, unknown> | null;
  const thumbs = row._thumbs as { source?: string | null; result?: string | null } | null;
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? null,
    sessionId: row.session_id as string,
    serviceType: row.service_type as GenerationServiceType,
    action: row.action as string,
    params: (row.params as Record<string, unknown>) ?? {},
    tokensCharged: (row.tokens_charged as number) ?? 0,
    tokensRefunded: (row.tokens_refunded as number) ?? 0,
    status: row.status as GenerationLogStatus,
    externalTaskId: row.external_task_id as string | undefined,
    referenceId: row.reference_id as string | undefined,
    errorCode: row.error_code as string | undefined,
    errorMessage: row.error_message as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    completedAt: row.completed_at as string | undefined,
    userEmail: (profile?.email as string) ?? undefined,
    userDisplayName: (profile?.display_name as string) ?? undefined,
    sourceThumbUrl: thumbs?.source ?? null,
    resultThumbUrl: thumbs?.result ?? null,
  };
}

export function useAdminLogs(
  initialFilter?: Partial<AdminLogsFilter>,
): UseAdminLogsReturn {
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefunding, setIsRefunding] = useState(false);
  const [filter, setFilterState] = useState<AdminLogsFilter>(() => ({
    ...DEFAULT_FILTER,
    ...initialFilter,
  }));
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const abortRef = useRef<AbortController | null>(null);

  const fetchLogs = useCallback(async () => {
    // Cancel previous in-flight request to prevent race conditions
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(page * PAGE_SIZE));

      if (filter.status !== "all") params.set("status", filter.status);
      if (filter.serviceType !== "all")
        params.set("serviceType", filter.serviceType);
      if (filter.from) params.set("from", filter.from);
      if (filter.userSearch) params.set("userSearch", filter.userSearch);
      if (filter.userId) params.set("userId", filter.userId);

      const res = await fetch(`/api/admin/generation-logs?${params}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("fetch failed");

      const data = await res.json();
      if (!controller.signal.aborted) {
        setLogs((data.logs ?? []).map(mapLogRow));
        setTotal(data.total ?? 0);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      toast.error("로그 조회에 실패했습니다.");
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [filter, page]);

  useEffect(() => {
    fetchLogs();
    return () => abortRef.current?.abort();
  }, [fetchLogs]);

  const setFilter = useCallback((partial: Partial<AdminLogsFilter>) => {
    setFilterState((prev) => ({ ...prev, ...partial }));
    setPage(0);
  }, []);

  const refund = useCallback(
    async (logId: string, reason?: string): Promise<boolean> => {
      setIsRefunding(true);
      try {
        const res = await fetch("/api/admin/refund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logId, reason }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`${data.refundedAmount} 토큰이 환불되었습니다.`);
          await fetchLogs();
          return true;
        }
        toast.error(data.error || "환불에 실패했습니다.");
        return false;
      } catch {
        toast.error("서버 오류가 발생했습니다.");
        return false;
      } finally {
        setIsRefunding(false);
      }
    },
    [fetchLogs],
  );

  return {
    logs,
    total,
    isLoading,
    filter,
    setFilter,
    page,
    pageSize: PAGE_SIZE,
    setPage,
    totalPages,
    refund,
    isRefunding,
    refresh: fetchLogs,
  };
}
