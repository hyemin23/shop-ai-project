"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { invalidateTokenBalance } from "@/hooks/use-token-balance";
import {
  type StudioStatus,
  type StudioType,
  type StudioBaseResponse,
  type GenerationMode,
} from "@/types/studio";
import { COOLDOWN_MS } from "@/config/studio";
import { useOnlineStatus } from "@/hooks/use-online-status";

interface UseStudioGenerateOptions {
  type: StudioType;
  mode?: GenerationMode;
  onSuccess?: (result: StudioBaseResponse) => void;
  onError?: (error: string) => void;
  onTokenInsufficient?: () => void;
}

interface UseStudioGenerateReturn {
  status: StudioStatus;
  result: StudioBaseResponse | null;
  error: string | null;
  isRetryable: boolean;
  isOnline: boolean;
  generate: (formData: FormData) => Promise<void>;
  reset: () => void;
}

export function useStudioGenerate({
  type,
  mode = "standard",
  onSuccess,
  onError,
  onTokenInsufficient,
}: UseStudioGenerateOptions): UseStudioGenerateReturn {
  const [status, setStatus] = useState<StudioStatus>("idle");
  const [result, setResult] = useState<StudioBaseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const isOnline = useOnlineStatus();
  const cooldownRef = useRef(false);

  const generate = useCallback(
    async (formData: FormData) => {
      if (!navigator.onLine) {
        toast.warning("오프라인 상태입니다", {
          description:
            "인터넷 연결을 확인한 후 다시 시도해주세요.",
        });
        return;
      }

      if (cooldownRef.current) return;

      cooldownRef.current = true;
      setTimeout(() => {
        cooldownRef.current = false;
      }, COOLDOWN_MS);

      setStatus("processing");
      setError(null);
      setResult(null);
      setIsRetryable(false);

      try {
        formData.set("mode", mode);

        const endpoint = `/api/studio/${type}`;
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        const data: StudioBaseResponse & {
          code?: string;
          retryable?: boolean;
        } = await response.json();

        if (!response.ok || !data.success) {
          // TOKEN_INSUFFICIENT 또는 FREE_TRIAL_EXCEEDED 처리
          if (
            data.code === "TOKEN_INSUFFICIENT" ||
            data.code === "FREE_TRIAL_EXCEEDED"
          ) {
            setStatus("error");
            setError(data.error || "토큰이 부족합니다.");
            onTokenInsufficient?.();
            return;
          }

          setStatus("error");
          setError(data.error || "알 수 없는 오류가 발생했습니다.");
          setIsRetryable(data.retryable || false);
          onError?.(data.error || "알 수 없는 오류가 발생했습니다.");
          return;
        }

        setStatus("success");
        setResult(data);

        if (data.fallbackUsed) {
          toast.info("기본 모델로 생성되었습니다", {
            description:
              "고품질 모델이 일시적으로 사용 불가하여 기본 모델로 처리되었습니다.",
          });
        }

        invalidateTokenBalance();
        onSuccess?.(data);
      } catch {
        setStatus("error");
        setError("네트워크 오류가 발생했습니다.");
        setIsRetryable(true);
        onError?.("네트워크 오류가 발생했습니다.");
      }
    },
    [type, mode, onSuccess, onError, onTokenInsufficient],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setIsRetryable(false);
  }, []);

  return { status, result, error, isRetryable, isOnline, generate, reset };
}
