"use client";

import { Construction, Clapperboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function MotionControlPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">모션 컨트롤</h1>
        <p className="text-muted-foreground">
          정적 이미지를 자연스러운 움직임 영상으로 변환합니다. (Kling AI 기반)
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Clapperboard className="h-8 w-8 text-primary" />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <Construction className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              준비 중
            </span>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            모션 컨트롤 기능은 현재 개발 중입니다. 곧 만나보실 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
