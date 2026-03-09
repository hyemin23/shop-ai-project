"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { TokenBalanceBadge } from "@/components/dashboard/token-balance-badge";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";

export function DashboardHeader() {
  const { toggleSidebar, state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={toggleSidebar}
          >
            {isExpanded ? (
              <PanelLeftCloseIcon className="h-4 w-4" />
            ) : (
              <PanelLeftOpenIcon className="h-4 w-4" />
            )}
            <span className="sr-only">사이드바 토글</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>
            {isExpanded ? "사이드바 접기" : "사이드바 펼치기"}
            <kbd className="ml-2 inline-flex items-center rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘B
            </kbd>
          </p>
        </TooltipContent>
      </Tooltip>
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">대시보드</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>개요</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <TokenBalanceBadge />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
