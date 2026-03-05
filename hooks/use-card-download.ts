"use client";

import { type RefObject, useCallback } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { toast } from "sonner";

export function useCardDownload() {
  const downloadCard = useCallback(
    async (elementRef: RefObject<HTMLDivElement | null>, filename: string) => {
      const node = elementRef.current;
      if (!node) return;

      try {
        const dataUrl = await toPng(node, { pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
      } catch {
        toast.error("이미지 다운로드에 실패했습니다.");
      }
    },
    [],
  );

  const downloadAll = useCallback(
    async (
      refs: Record<string, RefObject<HTMLDivElement | null>>,
      zipName = "상세정보카드",
    ) => {
      try {
        const zip = new JSZip();

        for (const [name, ref] of Object.entries(refs)) {
          const node = ref.current;
          if (!node) continue;

          const dataUrl = await toPng(node, { pixelRatio: 2 });
          const base64 = dataUrl.split(",")[1];
          zip.file(`${name}.png`, base64, { base64: true });
        }

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${zipName}.zip`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } catch {
        toast.error("전체 다운로드에 실패했습니다.");
      }
    },
    [],
  );

  return { downloadCard, downloadAll };
}
