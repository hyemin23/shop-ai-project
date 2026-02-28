"use client";

import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { type BatchItemState } from "@/types/batch";

interface BatchProgressPanelProps {
  items: BatchItemState[];
  isProcessing: boolean;
  className?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "대기 중",
    color: "text-muted-foreground",
  },
  processing: {
    icon: Loader2,
    label: "처리 중",
    color: "text-blue-500",
  },
  success: {
    icon: CheckCircle2,
    label: "완료",
    color: "text-green-500",
  },
  error: {
    icon: XCircle,
    label: "실패",
    color: "text-destructive",
  },
  skipped: {
    icon: SkipForward,
    label: "건너뜀",
    color: "text-yellow-500",
  },
};

export function BatchProgressPanel({
  items,
  isProcessing,
  className,
}: BatchProgressPanelProps) {
  if (items.length === 0) return null;

  const completed = items.filter(
    (i) => i.status === "success" || i.status === "error" || i.status === "skipped",
  ).length;
  const progressPercent = (completed / items.length) * 100;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {isProcessing ? "배치 처리 중..." : "처리 완료"}
        </span>
        <span className="text-muted-foreground">
          {completed}/{items.length}
        </span>
      </div>

      <Progress value={progressPercent} className="h-2" />

      <div className="max-h-60 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;

          return (
            <div
              key={item.index}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  config.color,
                  item.status === "processing" && "animate-spin",
                )}
              />
              <span className="min-w-0 flex-1 truncate">{item.fileName}</span>
              <span className={cn("shrink-0 text-xs", config.color)}>
                {item.error || config.label}
                {item.processingTime &&
                  ` (${(item.processingTime / 1000).toFixed(1)}s)`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
