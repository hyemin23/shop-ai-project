"use client";

import { useState, useCallback, useEffect } from "react";
import { type StudioHistoryItem, type StudioType } from "@/types/studio";

interface UseStudioHistoryOptions {
  type?: StudioType;
  limit?: number;
  autoFetch?: boolean;
}

interface UseStudioHistoryReturn {
  items: StudioHistoryItem[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useStudioHistory({
  type,
  limit = 20,
  autoFetch = true,
}: UseStudioHistoryOptions = {}): UseStudioHistoryReturn {
  const [items, setItems] = useState<StudioHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      params.set("limit", String(limit));
      params.set("offset", "0");

      const response = await fetch(`/api/history?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "히스토리를 불러오는데 실패했습니다.");
        return;
      }

      setItems(data.items);
      setOffset(data.items.length);
      setHasMore(data.items.length >= limit);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [type, limit]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      params.set("limit", String(limit));
      params.set("offset", String(offset));

      const response = await fetch(`/api/history?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "히스토리를 불러오는데 실패했습니다.");
        return;
      }

      setItems((prev) => [...prev, ...data.items]);
      setOffset((prev) => prev + data.items.length);
      setHasMore(data.items.length >= limit);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [type, limit, offset, isLoading, hasMore]);

  useEffect(() => {
    if (autoFetch) {
      fetchHistory();
    }
  }, [autoFetch, fetchHistory]);

  return { items, isLoading, error, fetchHistory, hasMore, loadMore };
}
