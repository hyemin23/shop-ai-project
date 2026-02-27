// 스튜디오 페이지 공통 레이아웃 컴포넌트
import { Monitor } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 lg:hidden">
        <Monitor className="h-4 w-4 shrink-0" />
        <p>
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
        <Card>
          <CardHeader>
            <CardTitle>입력</CardTitle>
          </CardHeader>
          <CardContent>{inputSection}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>결과</CardTitle>
          </CardHeader>
          <CardContent>{resultSection}</CardContent>
        </Card>
      </div>
    </div>
  );
}
