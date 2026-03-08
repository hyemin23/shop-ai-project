"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { GenerationLog } from "@/types/video";

interface RefundDialogProps {
  log: GenerationLog | null;
  onClose: () => void;
  onConfirm: (logId: string, reason?: string) => Promise<boolean>;
  isRefunding: boolean;
}

export function RefundDialog({
  log,
  onClose,
  onConfirm,
  isRefunding,
}: RefundDialogProps) {
  const [reason, setReason] = useState("");

  async function handleConfirm() {
    if (!log) return;
    const ok = await onConfirm(log.id, reason || undefined);
    if (ok) {
      setReason("");
      onClose();
    }
  }

  return (
    <Dialog
      open={!!log}
      onOpenChange={(open) => {
        if (!open) {
          setReason("");
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>환불 처리</DialogTitle>
          <DialogDescription>
            해당 생성 건의 토큰을 환불합니다. 환불 후 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        {log && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">로그 ID</span>
              <span className="font-mono text-xs">{log.id.slice(0, 12)}...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">사용자</span>
              <span className="text-sm">
                {log.userDisplayName || log.userEmail || "알 수 없음"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">서비스</span>
              <Badge variant="outline">{log.serviceType}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">액션</span>
              <span>{log.action}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">차감 토큰</span>
              <span className="font-bold">{log.tokensCharged}</span>
            </div>

            <Textarea
              placeholder="환불 사유를 입력해주세요 (선택)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRefunding}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isRefunding}
          >
            {isRefunding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            환불 실행
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
