"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { invalidateTokenBalance } from "@/hooks/use-token-balance";
import type {
  VideoGenerationStatus,
  VideoTaskStatus,
} from "@/types/video";
import {
  VIDEO_POLLING_INTERVAL_MS,
  VIDEO_POLLING_MAX_ATTEMPTS,
  VIDEO_COOLDOWN_MS,
} from "@/config/video";
import { useOnlineStatus } from "@/hooks/use-online-status";

interface UseVideoGenerateOptions<T> {
  apiPath: string;
  onSuccess?: (videoUrl: string) => void;
  onError?: (error: string) => void;
  onTokenInsufficient?: () => void;
}

interface UseVideoGenerateReturn<T> {
  status: VideoGenerationStatus;
  videoUrl: string | null;
  error: string | null;
  elapsedSeconds: number;
  isOnline: boolean;
  submit: (params: T) => Promise<void>;
  reset: () => void;
}

export function useVideoGenerate<T = Record<string, unknown>>({
  apiPath,
  onSuccess,
  onError,
  onTokenInsufficient,
}: UseVideoGenerateOptions<T>): UseVideoGenerateReturn<T> {
  const [status, setStatus] = useState<VideoGenerationStatus>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isOnline = useOnlineStatus();

  const cooldownRef = useRef(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    attemptRef.current = 0;
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const pollTask = useCallback(
    (taskId: string) => {
      setStatus("polling");
      setElapsedSeconds(0);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      pollingRef.current = setInterval(async () => {
        attemptRef.current += 1;

        if (attemptRef.current > VIDEO_POLLING_MAX_ATTEMPTS) {
          stopPolling();
          setStatus("failed");
          setError("비디오 생성 시간이 초과되었습니다. 다시 시도해주세요.");
          onError?.("비디오 생성 시간이 초과되었습니다.");
          return;
        }

        try {
          const res = await fetch(`${apiPath}/${taskId}`);
          const data = await res.json();

          const taskStatus: VideoTaskStatus = data.status;

          if (taskStatus === "succeed" && data.videoUrl) {
            stopPolling();
            setStatus("succeed");
            setVideoUrl(data.videoUrl);
            invalidateTokenBalance();
            onSuccess?.(data.videoUrl);
          } else if (taskStatus === "failed") {
            stopPolling();
            setStatus("failed");
            setError(data.error || "비디오 생성에 실패했습니다.");
            onError?.(data.error || "비디오 생성에 실패했습니다.");
          }
        } catch {
          // Network error during polling - continue trying
        }
      }, VIDEO_POLLING_INTERVAL_MS);
    },
    [apiPath, stopPolling, onSuccess, onError],
  );

  const submit = useCallback(
    async (params: T) => {
      if (!navigator.onLine) {
        toast.warning("오프라인 상태입니다", {
          description: "인터넷 연결을 확인한 후 다시 시도해주세요.",
        });
        return;
      }

      if (cooldownRef.current) return;

      cooldownRef.current = true;
      setTimeout(() => {
        cooldownRef.current = false;
      }, VIDEO_COOLDOWN_MS);

      setStatus("submitting");
      setError(null);
      setVideoUrl(null);
      setElapsedSeconds(0);

      try {
        const res = await fetch(apiPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          if (
            data.code === "TOKEN_INSUFFICIENT" ||
            data.code === "FREE_TRIAL_EXCEEDED"
          ) {
            setStatus("failed");
            setError(data.error || "토큰이 부족합니다.");
            onTokenInsufficient?.();
            return;
          }

          setStatus("failed");
          setError(data.error || "비디오 생성 요청에 실패했습니다.");
          onError?.(data.error || "비디오 생성 요청에 실패했습니다.");
          return;
        }

        pollTask(data.taskId);
      } catch {
        setStatus("failed");
        setError("네트워크 오류가 발생했습니다.");
        onError?.("네트워크 오류가 발생했습니다.");
      }
    },
    [apiPath, pollTask, onError, onTokenInsufficient],
  );

  const reset = useCallback(() => {
    stopPolling();
    setStatus("idle");
    setVideoUrl(null);
    setError(null);
    setElapsedSeconds(0);
  }, [stopPolling]);

  return { status, videoUrl, error, elapsedSeconds, isOnline, submit, reset };
}
