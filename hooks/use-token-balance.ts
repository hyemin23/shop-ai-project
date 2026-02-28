"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";

interface UseTokenBalanceReturn {
  balance: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useTokenBalance(): UseTokenBalanceReturn {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/tokens");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance ?? 0);
      }
    } catch {
      // 조용히 실패
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { balance, isLoading, refresh };
}
