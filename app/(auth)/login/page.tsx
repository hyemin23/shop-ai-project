"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  async function signInWithOAuth(provider: "kakao" | "google") {
    setSocialLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      toast.error("소셜 로그인에 실패했습니다.");
      setSocialLoading(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight">환영합니다</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          소셜 계정으로 간편하게 시작하세요
        </p>
      </div>

      {/* Social login buttons */}
      <div className="animate-fade-in-up space-y-3 [animation-delay:0.1s]">
        {/* Kakao */}
        <button
          type="button"
          className={cn(
            "relative flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-sm font-semibold",
            "bg-[#FEE500] text-[#191919]",
            "transition-all duration-200",
            "hover:-translate-y-0.5 hover:shadow-lg",
            "active:translate-y-0 active:shadow-none",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
          onClick={() => signInWithOAuth("kakao")}
          disabled={!!socialLoading}
        >
          {socialLoading === "kakao" ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <svg
              className="h-[18px] w-[18px] shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.8 5.16 4.5 6.54-.18.66-.66 2.4-.75 2.76-.12.48.18.48.36.36.15-.09 2.34-1.59 3.27-2.22.54.06 1.08.12 1.62.12 5.52 0 10-3.48 10-7.56S17.52 3 12 3z" />
            </svg>
          )}
          카카오로 계속하기
        </button>

        {/* Google */}
        <button
          type="button"
          className={cn(
            "relative flex w-full items-center justify-center gap-2.5 rounded-xl border border-border px-4 py-3.5 text-sm font-semibold",
            "bg-background text-foreground",
            "transition-all duration-200",
            "hover:-translate-y-0.5 hover:shadow-lg hover:border-border/60",
            "active:translate-y-0 active:shadow-none",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
          onClick={() => signInWithOAuth("google")}
          disabled={!!socialLoading}
        >
          {socialLoading === "google" ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <svg
              className="h-[18px] w-[18px] shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Google로 계속하기
        </button>
      </div>

      {/* Footer */}
      <div className="mt-10 animate-fade-in-up space-y-4 [animation-delay:0.2s]">
        <p className="text-center text-sm text-muted-foreground">
          처음이신가요?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            소셜 계정으로 바로 시작하기
          </Link>
        </p>
        <p className="text-center text-xs text-muted-foreground/50">
          계속하면{" "}
          <Link
            href="#"
            className="underline-offset-4 hover:underline hover:text-muted-foreground"
          >
            이용약관
          </Link>
          {" 및 "}
          <Link
            href="#"
            className="underline-offset-4 hover:underline hover:text-muted-foreground"
          >
            개인정보처리방침
          </Link>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
