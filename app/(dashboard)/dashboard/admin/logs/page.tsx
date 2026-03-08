"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminLogs } from "@/hooks/use-admin-logs";
import { LogFilterBar } from "@/components/admin/log-filter-bar";
import { GenerationLogTable } from "@/components/admin/generation-log-table";
import { RefundDialog } from "@/components/admin/refund-dialog";
import type { GenerationLog } from "@/types/video";

export default function AdminLogsPage() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId");
  const initialUserLabel = searchParams.get("userLabel");

  const {
    logs,
    total,
    isLoading,
    filter,
    setFilter,
    page,
    pageSize,
    setPage,
    totalPages,
    refund,
    isRefunding,
  } = useAdminLogs(
    initialUserId
      ? {
          userId: initialUserId,
          userLabel: initialUserLabel,
          from: null,
        }
      : undefined,
  );

  const [refundTarget, setRefundTarget] = useState<GenerationLog | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">생성 로그</h1>
        <p className="text-muted-foreground">
          모든 AI 생성 작업의 로그를 조회하고 관리합니다.
        </p>
      </div>

      <LogFilterBar filter={filter} onFilterChange={setFilter} />

      <GenerationLogTable
        logs={logs}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onRefund={setRefundTarget}
        isLoading={isLoading}
      />

      <RefundDialog
        log={refundTarget}
        onClose={() => setRefundTarget(null)}
        onConfirm={refund}
        isRefunding={isRefunding}
      />
    </div>
  );
}
