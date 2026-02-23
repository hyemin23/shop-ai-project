import type { Metadata } from "next"

import { ComponentShowcase } from "@/components/showcase/component-showcase"

export const metadata: Metadata = {
  title: "컴포넌트 쇼케이스",
  description: "스타터킷에 포함된 UI 컴포넌트를 확인하고 테스트할 수 있습니다.",
}

export default function ComponentsPage() {
  return (
    <div className="container py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">컴포넌트 쇼케이스</h1>
        <p className="text-muted-foreground">
          스타터킷에 포함된 UI 컴포넌트들을 카테고리별로 확인하고 테스트할 수
          있습니다.
        </p>
      </div>
      <ComponentShowcase />
    </div>
  )
}
