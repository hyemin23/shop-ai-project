"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  tokenBalance: number;
  freeTokensUsed: number;
  isMaster: boolean;
  isBeta: boolean;
  geminiApiKey: string | null;
  createdAt: string;
}

export interface UseAdminUsersReturn {
  users: AdminUser[];
  total: number;
  isLoading: boolean;
  search: string;
  setSearch: (s: string) => void;
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  totalPages: number;
  chargeTokens: (userId: string, amount: number) => Promise<boolean>;
  updateBetaStatus: (userId: string, isBeta: boolean, geminiApiKey?: string) => Promise<boolean>;
  isCharging: boolean;
  isUpdating: boolean;
  refresh: () => Promise<void>;
}

const PAGE_SIZE = 20;

function mapUserRow(row: Record<string, unknown>): AdminUser {
  return {
    id: row.id as string,
    email: (row.email as string) ?? "",
    displayName: (row.display_name as string) ?? null,
    avatarUrl: (row.avatar_url as string) ?? null,
    tokenBalance: (row.token_balance as number) ?? 0,
    freeTokensUsed: (row.free_tokens_used as number) ?? 0,
    isMaster: (row.is_master as boolean) ?? false,
    isBeta: (row.is_beta as boolean) ?? false,
    geminiApiKey: (row.gemini_api_key as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export function useAdminUsers(): UseAdminUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCharging, setIsCharging] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [search, setSearchState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const setSearch = useCallback((s: string) => {
    setSearchState(s);
    setPage(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(s), 300);
  }, []);

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(page * PAGE_SIZE));
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("fetch failed");

      const data = await res.json();
      setUsers((data.users ?? []).map(mapUserRow));
      setTotal(data.total ?? 0);
    } catch {
      if (!silent) toast.error("사용자 조회에 실패했습니다.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const chargeTokens = useCallback(
    async (userId: string, amount: number): Promise<boolean> => {
      setIsCharging(true);
      try {
        const res = await fetch("/api/tokens/master-charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, targetUserId: userId }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`${amount} 토큰이 충전되었습니다.`);
          await fetchUsers();
          return true;
        }
        toast.error(data.error || "충전에 실패했습니다.");
        return false;
      } catch {
        toast.error("서버 오류가 발생했습니다.");
        return false;
      } finally {
        setIsCharging(false);
      }
    },
    [fetchUsers],
  );

  const updateBetaStatus = useCallback(
    async (userId: string, isBeta: boolean, geminiApiKey?: string): Promise<boolean> => {
      setIsUpdating(true);
      try {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, isBeta, geminiApiKey }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(isBeta ? "베타 테스터로 설정되었습니다." : "베타 권한이 해제되었습니다.");
          await fetchUsers();
          return true;
        }
        toast.error(data.error || "권한 변경에 실패했습니다.");
        return false;
      } catch {
        toast.error("서버 오류가 발생했습니다.");
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchUsers],
  );

  return {
    users,
    total,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    totalPages,
    chargeTokens,
    updateBetaStatus,
    isCharging,
    isUpdating,
    refresh: fetchUsers,
  };
}
