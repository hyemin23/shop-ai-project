"use client";

import { useState, useCallback } from "react";

interface ClassifyResult {
  category: "top" | "bottom" | "outerwear" | "one-piece";
  label: string;
  description: string;
}

interface UseGarmentClassifyReturn {
  result: ClassifyResult | null;
  isClassifying: boolean;
  error: string | null;
  classify: (file: File) => Promise<void>;
  reset: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  top: "상의",
  bottom: "하의",
  outerwear: "아우터",
  "one-piece": "원피스/세트",
};

export function useGarmentClassify(): UseGarmentClassifyReturn {
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classify = useCallback(async (file: File) => {
    setIsClassifying(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.set("referenceImage", file);

      const response = await fetch("/api/studio/try-on/classify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "분류에 실패했습니다.");
        return;
      }

      setResult({
        category: data.category,
        label: data.label || CATEGORY_LABELS[data.category] || data.category,
        description: data.description || "",
      });
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsClassifying(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsClassifying(false);
  }, []);

  return { result, isClassifying, error, classify, reset };
}
