"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { siteConfig } from "@/config/site";
import { UserMenu } from "@/components/user-menu";
import { dashboardConfig } from "@/config/dashboard";
import { type SidebarNavGroup } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

// 그룹 내 항목 중 하나라도 현재 경로와 일치하는지 확인
function isGroupActive(group: SidebarNavGroup, pathname: string): boolean {
  return group.items.some((item) => pathname === item.href);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const displayName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "사용자";
  const email = user?.email || "게스트";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="group/logo flex items-center gap-2.5 font-bold text-lg tracking-tight select-none" draggable={false}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/25 transition-transform duration-200 group-hover/logo:scale-105">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="group-data-[collapsible=icon]:hidden">
            {siteConfig.name}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* 카테고리 그룹별 렌더링 — config 배열을 순회하여 자동 생성 */}
        {dashboardConfig.sidebarNavGroups.map((group) => (
          <Collapsible
            key={group.title}
            defaultOpen={true}
            className="group/collapsible"
          >
            <SidebarGroup>
              {/* 대분류 라벨 — 클릭 시 그룹 전체를 접고 펼침 */}
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center">
                  {group.title}
                  <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>

              {/* 하위 항목 목록 — Collapsible 열릴 때만 표시 */}
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      {/* 하단 사용자 정보 영역 */}
      <SidebarFooter className="p-4">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <UserMenu />
            <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden select-none">
              <span className="font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground">{email}</span>
            </div>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
