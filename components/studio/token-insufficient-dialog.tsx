"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, LogIn } from "lucide-react";

interface TokenInsufficientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TokenInsufficientDialog({
  open,
  onOpenChange,
}: TokenInsufficientDialogProps) {
  const { user } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            {user ? "토큰이 부족합니다" : "무료 체험 한도 초과"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "이미지 생성에 필요한 토큰이 부족합니다. 토큰을 충전하여 계속 이용해주세요."
              : "무료 체험 한도를 초과했습니다. 로그인하고 토큰을 충전하여 계속 이용해주세요."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          {user ? (
            <Button asChild>
              <Link href="/dashboard/tokens">
                <Coins className="mr-2 h-4 w-4" />
                토큰 충전
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                로그인
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
