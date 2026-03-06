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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { AdminUser } from "@/hooks/use-admin-users";

interface UserChargeDialogProps {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (userId: string, amount: number) => Promise<boolean>;
  isCharging: boolean;
}

export function UserChargeDialog({
  user,
  onClose,
  onConfirm,
  isCharging,
}: UserChargeDialogProps) {
  const [amount, setAmount] = useState("");

  const numAmount = Number(amount);
  const isValid =
    Number.isInteger(numAmount) && numAmount >= 1 && numAmount <= 100000;

  async function handleConfirm() {
    if (!user || !isValid) return;
    const ok = await onConfirm(user.id, numAmount);
    if (ok) {
      setAmount("");
      onClose();
    }
  }

  return (
    <Dialog
      open={!!user}
      onOpenChange={(open) => {
        if (!open) {
          setAmount("");
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>토큰 충전</DialogTitle>
          <DialogDescription>
            선택한 사용자에게 토큰을 직접 충전합니다.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">대상 사용자</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">현재 잔액</span>
              <span className="font-mono font-bold">
                {user.tokenBalance.toLocaleString()} 토큰
              </span>
            </div>

            <div className="space-y-2">
              <label htmlFor="charge-amount" className="text-muted-foreground">
                충전할 토큰 수 (1~100,000)
              </label>
              <Input
                id="charge-amount"
                type="number"
                min={1}
                max={100000}
                placeholder="충전할 토큰 수를 입력하세요"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCharging}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={isCharging || !isValid}>
            {isCharging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            충전 실행
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
