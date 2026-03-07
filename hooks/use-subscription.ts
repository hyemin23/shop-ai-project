"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { type SubscriptionStatus } from "@/types/payment";

interface SubscriptionData {
  id: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentFailedCount: number;
  createdAt: string;
}

interface UseSubscriptionReturn {
  subscription: SubscriptionData | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  cancel: (immediate?: boolean) => Promise<boolean>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.id;

  const refresh = useCallback(async () => {
    if (!userId) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/subscription");
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
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

  const cancel = useCallback(
    async (immediate = false): Promise<boolean> => {
      try {
        const res = await fetch("/api/subscription/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ immediate }),
        });
        const data = await res.json();
        if (data.success) {
          await refresh();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [refresh],
  );

  return { subscription, isLoading, refresh, cancel };
}
