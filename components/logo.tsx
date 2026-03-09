import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center select-none outline-none",
        className,
      )}
      draggable={false}
    >
      <span className="text-xl font-extrabold tracking-tight transition-opacity group-hover:opacity-80">
        똑핏
      </span>
    </Link>
  );
}
