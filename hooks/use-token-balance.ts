"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";

interface UseTokenBalanceReturn {
  balance: number;
  isMaster: boolean;
  isBeta: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useTokenBalance(): UseTokenBalanceReturn {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [isMaster, setIsMaster] = useState(false);
  const [isBeta, setIsBeta] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.id;

  const refresh = useCallback(async () => {
    if (!userId) {
      setBalance(0);
      setIsMaster(false);
      setIsBeta(false);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/tokens");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance ?? 0);
        setIsMaster(data.isMaster ?? false);
        setIsBeta(data.isBeta ?? false);
      }
    } catch {
      // 조용히 실패
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { balance, isMaster, isBeta, isLoading, refresh };
}
