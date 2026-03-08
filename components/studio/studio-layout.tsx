// 스튜디오 페이지 공통 레이아웃 컴포넌트
import { Monitor } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface StudioLayoutProps {
  title: string;
  description: string;
  inputSection: React.ReactNode;
  resultSection: React.ReactNode;
  controls?: React.ReactNode;
}

export function StudioLayout({
  title,
  description,
  inputSection,
  resultSection,
  controls,
}: StudioLayoutProps) {
  return (
    <div className="space-y-6">
      {/* 모바일 데스크톱 권장 배너 */}
      <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-foreground lg:hidden">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Monitor className="h-4 w-4 text-primary" />
        </div>
        <p className="text-muted-foreground">
          데스크톱에서 더 편리하게 사용하세요. 넓은 화면에서 이미지를 비교하고
          편집할 수 있습니다.
        </p>
      </div>

      {/* 상단 헤더 */}
      {controls ? (
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {controls}
        </div>
      ) : (
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      )}

      {/* 본문: 2단 그리드 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardContent className="pt-6">{inputSection}</CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="pt-6">{resultSection}</CardContent>
        </Card>
      </div>
    </div>
  );
}
