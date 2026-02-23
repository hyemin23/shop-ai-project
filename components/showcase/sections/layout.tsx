"use client"

import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShowcaseCard } from "@/components/showcase/showcase-card"

export function LayoutSection() {
  return (
    <div className="space-y-6">
      <ShowcaseCard title="Separator" description="가로/세로 구분선">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">가로 구분선</p>
            <Separator className="my-2" />
            <p className="text-muted-foreground text-sm">
              위아래를 구분합니다.
            </p>
          </div>
          <div className="flex h-5 items-center gap-4 text-sm">
            <span>블로그</span>
            <Separator orientation="vertical" />
            <span>문서</span>
            <Separator orientation="vertical" />
            <span>소스 코드</span>
          </div>
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Skeleton" description="카드 로딩 상태">
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </ShowcaseCard>

      <ShowcaseCard
        title="ScrollArea"
        description="고정 높이 + 오버플로우 컨텐츠"
      >
        <ScrollArea className="h-48 w-full max-w-sm rounded-md border p-4">
          <div className="space-y-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="text-sm">
                <div className="font-medium">항목 {i + 1}</div>
                <p className="text-muted-foreground">
                  스크롤 영역 안의 컨텐츠입니다. 고정 높이를 초과하면 스크롤이
                  활성화됩니다.
                </p>
                {i < 19 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </ShowcaseCard>
    </div>
  )
}
