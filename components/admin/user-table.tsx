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
import { ChevronLeft, ChevronRight, Coins, FlaskConical } from "lucide-react";
import type { AdminUser } from "@/hooks/use-admin-users";

interface UserTableProps {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onCharge: (user: AdminUser) => void;
  onBetaEdit: (user: AdminUser) => void;
  isLoading: boolean;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function UserTable({
  users,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onCharge,
  onBetaEdit,
  isLoading,
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        조회된 사용자가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이메일</TableHead>
              <TableHead className="w-[120px]">이름</TableHead>
              <TableHead className="w-[100px] text-right">토큰 잔액</TableHead>
              <TableHead className="w-[90px] text-right">무료 사용</TableHead>
              <TableHead className="w-[80px]">역할</TableHead>
              <TableHead className="w-[100px]">가입일</TableHead>
              <TableHead className="w-[70px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell className="text-sm">
                  {u.displayName || "-"}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {u.tokenBalance.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {u.freeTokensUsed.toLocaleString()}
                </TableCell>
                <TableCell className="space-x-1">
                  {u.isMaster && (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                      마스터
                    </Badge>
                  )}
                  {u.isBeta && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      베타
                    </Badge>
                  )}
                  {!u.isMaster && !u.isBeta && (
                    <Badge
                      variant="secondary"
                      className="text-muted-foreground"
                    >
                      일반
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {formatDate(u.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => onCharge(u)}
                    >
                      <Coins className="mr-1 h-3 w-3" />
                      충전
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => onBetaEdit(u)}
                    >
                      <FlaskConical className="mr-1 h-3 w-3" />
                      베타
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          총 {total.toLocaleString()}명 | 페이지 {page + 1}/{totalPages}
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
