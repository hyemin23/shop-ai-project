"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "cookie-consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // 쿠키 동의 미완료 시 배너 표시
      const timer = setTimeout(() => setShow(true), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-screen-md flex-col items-center gap-3 rounded-xl border bg-background/95 px-6 py-4 shadow-lg backdrop-blur-sm sm:flex-row sm:justify-between">
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          이 사이트는 서비스 제공을 위해 쿠키를 사용합니다.{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-foreground"
          >
            개인정보처리방침
          </Link>
          에서 자세히 확인하세요.
        </p>
        <Button onClick={accept} size="sm" className="shrink-0">
          동의
        </Button>
      </div>
    </div>
  );
}
