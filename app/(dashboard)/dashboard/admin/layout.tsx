"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type MasterStatus = "pending" | "granted" | "denied";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const [masterStatus, setMasterStatus] = useState<MasterStatus>("pending");
  const router = useRouter();

  useEffect(() => {
    // auth 로딩 중에는 대기
    if (authLoading) return;

    // 로그인 안 된 경우
    if (!user) {
      router.replace("/dashboard");
      return;
    }

    // /api/tokens로 isMaster 확인 (캐시 우회: cache-busting)
    fetch(`/api/tokens?_=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : { isMaster: false }))
      .then((data) => {
        if (data.isMaster) {
          setMasterStatus("granted");
        } else {
          setMasterStatus("denied");
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        setMasterStatus("denied");
        router.replace("/dashboard");
      });
  }, [authLoading, user, router]);

  if (authLoading || masterStatus === "pending") {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (masterStatus !== "granted") return null;

  return <>{children}</>;
}
