"use client";

import { Construction, AudioLines } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function LipSyncPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">립싱크</h1>
        <p className="text-muted-foreground">
          상품 소개 영상에 나레이션을 동기화합니다.
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <AudioLines className="h-8 w-8 text-primary" />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <Construction className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              준비 중
            </span>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            립싱크 기능은 현재 개발 중입니다. 곧 만나보실 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
