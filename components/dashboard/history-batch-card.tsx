"use client";

import { useState } from "react";
import Image from "next/image";
import { type StudioHistoryItem } from "@/types/studio";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Download,
  Package,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { downloadImage } from "@/lib/download";
import { SERVICE_TYPE_LABELS as TYPE_LABELS, SERVICE_TYPE_COLORS as TYPE_COLORS } from "@/config/studio";
// JSZip is dynamically imported in handleZipDownload to reduce bundle size

interface HistoryBatchCardProps {
  batchId: string;
  batchType: string;
  items: StudioHistoryItem[];
  totalTime: number;
  defaultOpen?: boolean;
  onDeleteItem: (item: StudioHistoryItem) => void;
  onPreviewItem?: (item: StudioHistoryItem) => void;
}

export function HistoryBatchCard({
  batchType,
  items,
  totalTime,
  defaultOpen = false,
  onDeleteItem,
  onPreviewItem,
}: HistoryBatchCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleZipDownload = async () => {
    setIsDownloading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const fetchPromises = items.map(async (item, idx) => {
        const url = item.resultImageUrl;
        if (!url) return;
        const res = await fetch(url);
        const blob = await res.blob();
        const ext = url.includes(".png") ? "png" : "webp";
        zip.file(`${batchType}_${idx + 1}.${ext}`, blob);
      });
      await Promise.all(fetchPromises);

      const content = await zip.generateAsync({ type: "blob" });
      const blobUrl = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${TYPE_LABELS[batchType] || batchType}_${items.length}장.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success("ZIP 다운로드 완료");
    } catch {
      toast.error("ZIP 다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  const colorClass = TYPE_COLORS[batchType] || "";

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-3 p-3">
          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
          <Badge variant="secondary" className={colorClass}>
            {TYPE_LABELS[batchType] || batchType}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {items.length}개 결과
          </span>
          <span className="text-xs text-muted-foreground">
            {(totalTime / 1000).toFixed(1)}초
          </span>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={handleZipDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        {/* 접힌 상태: 썸네일 미리보기 (확대) */}
        {!isOpen && (
          <div className="px-3 pb-3 flex gap-1.5 overflow-x-auto">
            {items.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="relative w-20 h-[106px] rounded shrink-0 bg-muted overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-shadow"
                onClick={() => onPreviewItem?.(item)}
              >
                {(item.resultThumbUrl || item.resultImageUrl) && (
                  <Image
                    src={item.resultThumbUrl || item.resultImageUrl}
                    alt="결과"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
            ))}
            {items.length > 6 && (
              <div className="flex items-center justify-center w-20 h-[106px] rounded bg-muted text-xs text-muted-foreground shrink-0">
                +{items.length - 6}
              </div>
            )}
          </div>
        )}

        <CollapsibleContent>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {items.map((item) => (
                <div key={item.id} className="group relative">
                  <div
                    className="relative aspect-[3/4] rounded overflow-hidden bg-muted cursor-pointer"
                    onClick={() => onPreviewItem?.(item)}
                  >
                    {(item.resultThumbUrl || item.resultImageUrl) && (
                      <Image
                        src={item.resultThumbUrl || item.resultImageUrl}
                        alt="결과"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      {item.resultImageUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-white hover:text-white hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(
                              item.resultImageUrl,
                              `${item.type}_${item.id.slice(0, 8)}.webp`,
                            );
                          }}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-white hover:text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
