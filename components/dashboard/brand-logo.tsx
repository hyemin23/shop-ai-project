"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group/logo flex items-center select-none outline-none",
        className,
      )}
      draggable={false}
    >
      {/* collapsed 시: "핏" 한 글자만 중앙 표시 */}
      <span className="hidden text-base font-extrabold tracking-tight transition-opacity group-hover/logo:opacity-70 group-data-[collapsible=icon]:block group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:text-center">
        핏
      </span>

      {/* expanded 시: "똑핏 · 똑똑한 핏" 한 줄 */}
      <div className="flex items-baseline gap-1.5 group-data-[collapsible=icon]:hidden">
        <span className="text-[20px] font-extrabold tracking-tight leading-none">
          똑핏
        </span>
        <span className="text-muted-foreground/50 font-light leading-none">—</span>
        <span className="text-[13px] font-medium text-muted-foreground leading-none">
          똑똑, 핏 나왔습니다
        </span>
      </div>
    </Link>
  );
}
