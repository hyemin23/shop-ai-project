"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading } = useAuth();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <MobileNav />
        <Logo />

        <nav className="ml-8 hidden items-center gap-1 md:flex">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
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
