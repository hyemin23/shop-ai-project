"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";

const TOKEN_BALANCE_UPDATE_EVENT = "token-balance-update";

/** 토큰 잔액 갱신을 트리거하는 유틸. 생성 완료 후 호출. */
export function invalidateTokenBalance() {
  window.dispatchEvent(new Event(TOKEN_BALANCE_UPDATE_EVENT));
}

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
      const res = await fetch("/api/tokens?_=" + Date.now());
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

  // 생성 완료 이벤트 수신 시 잔액 갱신
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener(TOKEN_BALANCE_UPDATE_EVENT, handler);
    return () => window.removeEventListener(TOKEN_BALANCE_UPDATE_EVENT, handler);
  }, [refresh]);

  return { balance, isMaster, isBeta, isLoading, refresh };
}
