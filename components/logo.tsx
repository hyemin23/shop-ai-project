import { Zap } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 font-bold text-lg tracking-tight">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/25 transition-transform duration-200 group-hover:scale-105">
        <Zap className="h-4 w-4 text-primary-foreground" />
      </div>
      <span>{siteConfig.name}</span>
    </Link>
  );
}
