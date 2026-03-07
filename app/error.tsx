"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold tracking-tighter text-muted-foreground/30">
          500
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          문제가 발생했습니다
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <div className="mt-8">
          <Button onClick={reset}>다시 시도</Button>
        </div>
      </div>
    </div>
  );
}
