"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";
import { dashboardConfig } from "@/config/dashboard";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const displayName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "사용자";
  const email = user?.email || "게스트";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardConfig.sidebarNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <UserMenu />
            <div className="flex flex-col text-sm">
              <span className="font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground">{email}</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
