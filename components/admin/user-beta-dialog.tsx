"use client";

import { useState, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
import type { AdminUser } from "@/hooks/use-admin-users";

interface UserBetaDialogProps {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (userId: string, isBeta: boolean, geminiApiKey?: string) => Promise<boolean>;
  isUpdating: boolean;
}

export function UserBetaDialog({
  user,
  onClose,
  onConfirm,
  isUpdating,
}: UserBetaDialogProps) {
  const initialBeta = useMemo(() => user?.isBeta ?? false, [user]);
  const initialKey = useMemo(() => user?.geminiApiKey ?? "", [user]);
  const [isBeta, setIsBeta] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // Dialog가 열릴 때 user prop이 변경되면 상태 초기화
  const currentUserId = user?.id;
  const [prevUserId, setPrevUserId] = useState<string | undefined>();
  if (currentUserId !== prevUserId) {
    setPrevUserId(currentUserId);
    setIsBeta(initialBeta);
    setApiKey(initialKey);
  }

  async function handleConfirm() {
    if (!user) return;
    const ok = await onConfirm(user.id, isBeta, apiKey || undefined);
    if (ok) onClose();
  }

  return (
    <Dialog
      open={!!user}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>베타 테스터 설정</DialogTitle>
          <DialogDescription>
            베타 테스터는 개인 Gemini API 키로 이미지를 생성하며, 비디오 기능은 이용할 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">대상 사용자</span>
              <span className="font-medium">{user.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">베타 테스터</span>
              <Switch checked={isBeta} onCheckedChange={setIsBeta} />
            </div>

            {isBeta && (
              <div className="space-y-2">
                <label htmlFor="gemini-key" className="text-muted-foreground">
                  Gemini API Key
                </label>
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder="AIza..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground/70">
                  베타 유저의 이미지 생성에 사용될 개인 API 키입니다.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isUpdating || (isBeta && !apiKey.trim())}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
