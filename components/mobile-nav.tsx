"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Shirt,
  Palette,
  PersonStanding,
  Wallpaper,
  Layers,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Logo } from "@/components/logo";

const mobileStudioItems = [
  { title: "의류 교체", href: "/dashboard/studio", icon: Shirt },
  { title: "색상 변경", href: "/dashboard/studio/color-swap", icon: Palette },
  { title: "포즈 변경", href: "/dashboard/studio/pose-transfer", icon: PersonStanding },
  { title: "배경 변경", href: "/dashboard/studio/background-swap", icon: Wallpaper },
  { title: "배치 처리", href: "/dashboard/studio/batch", icon: Layers },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 px-4 py-5">
        <SheetTitle className="sr-only">내비게이션 메뉴</SheetTitle>

        <div className="mb-5 px-1">
          <Logo />
        </div>

        <nav>
          <Collapsible defaultOpen className="group/collapsible">
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 transition-colors hover:text-muted-foreground">
                AI 스튜디오
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-0.5">
              {mobileStudioItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-primary" />
                  {item.title}
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
