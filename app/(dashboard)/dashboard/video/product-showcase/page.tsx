"use client";

import { Construction, RotateCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductShowcasePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">상품 쇼케이스</h1>
        <p className="text-muted-foreground">
          카메라 컨트롤로 상품 회전 및 줌인 영상을 생성합니다.
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <RotateCw className="h-8 w-8 text-primary" />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <Construction className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              준비 중
            </span>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            상품 쇼케이스 기능은 현재 개발 중입니다. 곧 만나보실 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
