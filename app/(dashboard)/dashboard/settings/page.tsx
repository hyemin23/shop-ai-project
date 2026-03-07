"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTokenBalance } from "@/hooks/use-token-balance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, Mail, User, Coins, Loader2, Trash2, Bell } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function SettingsPage() {
  const { user, isLoading, signOut } = useAuth();
  const { balance, isLoading: balanceLoading } = useTokenBalance();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">설정</h1>
          <p className="text-muted-foreground">
            계정 설정 및 환경설정을 관리합니다.
          </p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">설정</h1>
          <p className="text-muted-foreground">
            계정 설정 및 환경설정을 관리합니다.
          </p>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              로그인 후 설정을 관리할 수 있습니다.
            </p>
            <Button asChild className="mt-4">
              <Link href="/login">로그인</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName =
    user.user_metadata?.name || user.email?.split("@")[0] || "사용자";
  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = displayName.charAt(0).toUpperCase();
  const provider = user.app_metadata?.provider;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground">
          계정 설정 및 환경설정을 관리합니다.
        </p>
      </div>

      {/* 프로필 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
          <CardDescription>계정의 기본 정보입니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{displayName}</h3>
              {provider && provider !== "email" && (
                <p className="text-sm text-muted-foreground capitalize">
                  {provider} 계정으로 로그인
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">이메일</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">가입일</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 토큰 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>토큰 잔액</CardTitle>
          <CardDescription>현재 보유 중인 토큰 정보입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">
                  {balanceLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    `${new Intl.NumberFormat("ko-KR").format(balance)} 토큰`
                  )}
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/tokens">토큰 충전</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      <MarketingConsentCard userId={user.id} />

      {/* 로그아웃 */}
      <Card>
        <CardHeader>
          <CardTitle>계정</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </CardContent>
      </Card>

      {/* 회원 탈퇴 */}
      <DeleteAccountCard userEmail={user.email ?? ""} />
    </div>
  );
}

function MarketingConsentCard({ userId }: { userId: string }) {
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchConsent = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("marketing_agreed")
      .eq("id", userId)
      .single();
    if (data) setAgreed(data.marketing_agreed ?? false);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchConsent();
  }, [fetchConsent]);

  async function handleToggle(checked: boolean) {
    setIsSaving(true);
    setAgreed(checked);
    try {
      const res = await fetch("/api/consent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketing_agreed: checked }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "설정 변경에 실패했습니다.");
        setAgreed(!checked);
        return;
      }
      toast.success(checked ? "마케팅 수신에 동의했습니다." : "마케팅 수신 동의를 철회했습니다.");
    } catch {
      toast.error("설정 변경 중 오류가 발생했습니다.");
      setAgreed(!checked);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          알림 설정
        </CardTitle>
        <CardDescription>마케팅 정보 수신 설정을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing-consent">마케팅 수신 동의</Label>
            <p className="text-sm text-muted-foreground">
              이벤트, 할인, 신기능 안내 등을 받습니다.
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-11 rounded-full" />
          ) : (
            <Switch
              id="marketing-consent"
              checked={agreed}
              onCheckedChange={handleToggle}
              disabled={isSaving}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DeleteAccountCard({ userEmail }: { userEmail: string }) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const canDelete = confirmText === "탈퇴합니다";

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "계정 삭제에 실패했습니다.");
        return;
      }
      toast.success("계정이 삭제되었습니다.");
      window.location.href = "/login";
    } catch {
      toast.error("계정 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">회원 탈퇴</CardTitle>
        <CardDescription>
          탈퇴 시 모든 데이터(프로필, 토큰, 구독, 동의 기록)가 영구 삭제되며 복구할 수 없습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConfirmText(""); }}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" />
              회원 탈퇴
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>이 작업은 되돌릴 수 없습니다. 다음 데이터가 영구 삭제됩니다:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>프로필 및 계정 정보</li>
                    <li>보유 토큰 및 거래 내역</li>
                    <li>활성 구독 (자동 해지)</li>
                    <li>업로드한 이미지</li>
                  </ul>
                  <p className="pt-2">
                    확인을 위해 <strong className="text-foreground">탈퇴합니다</strong>를 입력해주세요.
                  </p>
                  <Input
                    placeholder="탈퇴합니다"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    disabled={isDeleting}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={!canDelete || isDeleting}
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                탈퇴하기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
