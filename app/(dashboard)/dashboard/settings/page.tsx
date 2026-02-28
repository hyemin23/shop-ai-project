"use client";

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
import { LogOut, Mail, User, Coins } from "lucide-react";
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
    </div>
  );
}
