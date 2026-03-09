"use client";

import Link from "next/link";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Coins, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function TokenBalanceBadge() {
  const { user, isLoading: authLoading } = useAuth();
  const { balance, isLoading } = useTokenBalance();

  if (authLoading || isLoading) {
    return <Skeleton className="h-6 w-16 rounded-full" />;
  }

  if (!user) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href="/dashboard/tokens">
          <Badge
            variant={balance <= 0 ? "destructive" : "secondary"}
            className="cursor-pointer gap-1 px-2.5 py-0.5 transition-colors hover:bg-accent"
          >
            <Coins className="h-3.5 w-3.5" />
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <span>{new Intl.NumberFormat("ko-KR").format(balance)}</span>
            )}
          </Badge>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>보유 토큰 {new Intl.NumberFormat("ko-KR").format(balance)}개 — 클릭하여 충전</p>
      </TooltipContent>
    </Tooltip>
  );
}
