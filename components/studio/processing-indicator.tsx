// AI 이미지 생성 처리 중 표시 컴포넌트
import { Loader2 } from "lucide-react";

interface ProcessingIndicatorProps {
  message?: string;
}

export function ProcessingIndicator({
  message = "이미지를 생성하고 있습니다...",
}: ProcessingIndicatorProps) {
  return (
    <div
      className="flex h-64 flex-col items-center justify-center gap-3 p-8"
      aria-live="polite"
      role="status"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs text-muted-foreground">보통 10~30초 소요</p>
    </div>
  );
}
