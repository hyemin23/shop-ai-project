"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { getFeatureGroups } from "@/config/dashboard";

const featureGroups = getFeatureGroups();

export function SiteHeader() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading } = useAuth();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4 md:px-8">
        <MobileNav />
        <Logo />

        <nav className="ml-3 hidden items-center md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "group flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:bg-accent hover:text-foreground",
                  "data-[state=open]:bg-accent/50 data-[state=open]:text-foreground",
                  "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                AI 도구
                <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-72 p-1.5">
              {featureGroups.map((group, groupIdx) => (
                <div key={group.title}>
                  {groupIdx > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {group.title}
                  </DropdownMenuLabel>

                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-2 py-2 transition-colors",
                        "hover:bg-accent focus:bg-accent focus:outline-none",
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/8 ring-1 ring-primary/10 transition-colors group-hover:bg-primary/15">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-tight text-foreground">
                          {item.title}
                        </span>
                        {item.description && (
                          <span className="text-xs leading-tight text-muted-foreground">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {!mounted || isLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="hidden h-8 w-16 rounded-lg sm:block" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          ) : user ? (
            <>
              <Button size="sm" asChild className="hidden shadow-sm shadow-primary/20 sm:inline-flex">
                <Link href="/dashboard">대시보드</Link>
              </Button>
              <UserMenu />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">로그인</Link>
              </Button>
              <Button size="sm" asChild className="shadow-sm shadow-primary/20">
                <Link href="/register">시작하기</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
