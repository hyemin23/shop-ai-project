"use client"

import { Loader2, Mail, Plus, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShowcaseCard } from "@/components/showcase/showcase-card"

export function ButtonsBadgesSection() {
  return (
    <div className="space-y-6">
      <ShowcaseCard title="Button Variants" description="6가지 버튼 스타일">
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Button Sizes" description="4가지 크기">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">XS</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </ShowcaseCard>

      <ShowcaseCard
        title="Icon Buttons"
        description="아이콘 전용 버튼 크기"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button size="icon-xs" variant="outline">
            <Plus />
          </Button>
          <Button size="icon-sm" variant="outline">
            <Plus />
          </Button>
          <Button size="icon" variant="outline">
            <Settings />
          </Button>
          <Button size="icon-lg" variant="outline">
            <Settings />
          </Button>
        </div>
      </ShowcaseCard>

      <ShowcaseCard
        title="아이콘 + 텍스트"
        description="아이콘과 텍스트 조합"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Mail /> 이메일 보내기
          </Button>
          <Button variant="outline">
            <Plus /> 추가하기
          </Button>
          <Button variant="secondary">
            <Settings /> 설정
          </Button>
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="상태" description="비활성화 및 로딩 상태">
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>비활성화</Button>
          <Button disabled variant="outline">
            비활성화
          </Button>
          <Button disabled>
            <Loader2 className="animate-spin" />
            로딩 중...
          </Button>
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Badge Variants" description="6가지 뱃지 스타일">
        <div className="flex flex-wrap gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
          <Badge variant="link">Link</Badge>
        </div>
      </ShowcaseCard>
    </div>
  )
}
