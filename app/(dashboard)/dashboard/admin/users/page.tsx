"use client";

import { useState } from "react";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { UserTable } from "@/components/admin/user-table";
import { UserChargeDialog } from "@/components/admin/user-charge-dialog";
import { UserBetaDialog } from "@/components/admin/user-beta-dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { AdminUser } from "@/hooks/use-admin-users";

export default function AdminUsersPage() {
  const {
    users,
    total,
    isLoading,
    search,
    setSearch,
    page,
    pageSize,
    setPage,
    totalPages,
    chargeTokens,
    updateBetaStatus,
    isCharging,
    isUpdating,
  } = useAdminUsers();

  const [chargeTarget, setChargeTarget] = useState<AdminUser | null>(null);
  const [betaTarget, setBetaTarget] = useState<AdminUser | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">사용자 관리</h1>
        <p className="text-muted-foreground">
          등록된 사용자를 조회하고 토큰을 충전합니다.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="이메일 또는 이름으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <UserTable
        users={users}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onCharge={setChargeTarget}
        onBetaEdit={setBetaTarget}
        isLoading={isLoading}
      />

      <UserChargeDialog
        user={chargeTarget}
        onClose={() => setChargeTarget(null)}
        onConfirm={chargeTokens}
        isCharging={isCharging}
      />

      <UserBetaDialog
        user={betaTarget}
        onClose={() => setBetaTarget(null)}
        onConfirm={updateBetaStatus}
        isUpdating={isUpdating}
      />
    </div>
  );
}
