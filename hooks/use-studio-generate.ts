"use client";

import { useState, useCallback, useRef } from "react";
import {
  type StudioStatus,
  type StudioType,
  type StudioBaseResponse,
  type GenerationMode,
} from "@/types/studio";
import { COOLDOWN_MS } from "@/config/studio";

interface UseStudioGenerateOptions {
  type: StudioType;
  mode?: GenerationMode;
  onSuccess?: (result: StudioBaseResponse) => void;
  onError?: (error: string) => void;
}

interface UseStudioGenerateReturn {
  status: StudioStatus;
  result: StudioBaseResponse | null;
  error: string | null;
  isRetryable: boolean;
  generate: (formData: FormData) => Promise<void>;
  reset: () => void;
}

export function useStudioGenerate({
  type,
  mode = "standard",
  onSuccess,
  onError,
}: UseStudioGenerateOptions): UseStudioGenerateReturn {
  const [status, setStatus] = useState<StudioStatus>("idle");
  const [result, setResult] = useState<StudioBaseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const cooldownRef = useRef(false);

  const generate = useCallback(
    async (formData: FormData) => {
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
          setStatus("error");
          setError(data.error || "알 수 없는 오류가 발생했습니다.");
          setIsRetryable(data.retryable || false);
          onError?.(data.error || "알 수 없는 오류가 발생했습니다.");
          return;
        }

        setStatus("success");
        setResult(data);
        onSuccess?.(data);
      } catch {
        setStatus("error");
        setError("네트워크 오류가 발생했습니다.");
        setIsRetryable(true);
        onError?.("네트워크 오류가 발생했습니다.");
      }
    },
    [type, mode, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setIsRetryable(false);
  }, []);

  return { status, result, error, isRetryable, generate, reset };
}
