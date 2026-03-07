import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold tracking-tighter text-muted-foreground/30">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">대시보드</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
