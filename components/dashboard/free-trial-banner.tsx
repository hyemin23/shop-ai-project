"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

export function FreeTrialBanner() {
  const { user, isLoading } = useAuth();

  if (isLoading || user) return null;

  return (
    <Alert className="border-primary/20 bg-primary/5">
      <Gift className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          무료 체험 중입니다. 로그인하면 더 많은 기능을 이용할 수 있어요!
        </span>
        <Button size="sm" variant="outline" asChild className="ml-4 shrink-0">
          <Link href="/login">로그인</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
