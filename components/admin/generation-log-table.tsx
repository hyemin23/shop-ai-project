"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { GenerationLog, GenerationLogStatus } from "@/types/video";

interface GenerationLogTableProps {
  logs: GenerationLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefund: (log: GenerationLog) => void;
  isLoading: boolean;
}

const STATUS_BADGE: Record<
  GenerationLogStatus,
  { label: string; className: string }
> = {
  initiated: {
    label: "시작됨",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  processing: {
    label: "처리중",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  },
  tokens_spent: {
    label: "토큰차감",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  },
  succeed: {
    label: "성공",
    className: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  },
  failed: {
    label: "실패",
    className: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  },
  refunded: {
    label: "환불됨",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  },
  abandoned: {
    label: "중단됨",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(s: string | null | undefined, len: number) {
  if (!s) return "-";
  return s.length > len ? s.slice(0, len) + "..." : s;
}

export function GenerationLogTable({
  logs,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onRefund,
  isLoading,
}: GenerationLogTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        조회된 로그가 없습니다.
      </div>
    );
  }

  const canRefund = (status: GenerationLogStatus) =>
    status === "succeed" || status === "tokens_spent";

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">일시</TableHead>
              <TableHead className="w-[160px]">사용자</TableHead>
              <TableHead className="w-[70px]">서비스</TableHead>
              <TableHead>액션</TableHead>
              <TableHead className="w-[80px]">상태</TableHead>
              <TableHead className="w-[60px] text-right">차감</TableHead>
              <TableHead className="w-[60px] text-right">환불</TableHead>
              <TableHead>에러</TableHead>
              <TableHead className="w-[60px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const badge = STATUS_BADGE[log.status];
              return (
                <TableRow key={log.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex flex-col">
                      <span className="font-medium truncate">
                        {log.userDisplayName || log.userEmail || "-"}
                      </span>
                      {log.userEmail && log.userDisplayName && (
                        <span className="text-muted-foreground text-[11px] truncate">
                          {log.userEmail}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.serviceType === "studio"
                          ? "border-blue-300 text-blue-700 dark:text-blue-300"
                          : "border-violet-300 text-violet-700 dark:text-violet-300"
                      }
                    >
                      {log.serviceType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{log.action}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {log.tokensCharged != null ? log.tokensCharged : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {log.tokensRefunded != null ? log.tokensRefunded : "-"}
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    {log.errorMessage ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help text-xs text-red-600 dark:text-red-400">
                            {truncate(log.errorMessage, 20)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">{log.errorMessage}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {canRefund(log.status) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => onRefund(log)}
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        환불
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          총 {total.toLocaleString()}건 | 페이지 {page + 1}/{totalPages}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
