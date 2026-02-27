import { Zap } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
      <Zap className="h-5 w-5 text-primary" />
      <span>{siteConfig.name}</span>
    </Link>
  );
}
