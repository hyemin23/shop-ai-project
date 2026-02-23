"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb"
import { ShowcaseCard } from "@/components/showcase/showcase-card"

export function NavigationSection() {
  return (
    <div className="space-y-6">
      <ShowcaseCard
        title="Tabs - Default"
        description="기본 탭 스타일 (배경 있음)"
      >
        <Tabs defaultValue="account" className="w-full max-w-md">
          <TabsList>
            <TabsTrigger value="account">계정</TabsTrigger>
            <TabsTrigger value="password">비밀번호</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <p className="text-muted-foreground text-sm pt-2">
              계정 설정을 변경할 수 있습니다.
            </p>
          </TabsContent>
          <TabsContent value="password">
            <p className="text-muted-foreground text-sm pt-2">
              비밀번호를 변경할 수 있습니다.
            </p>
          </TabsContent>
          <TabsContent value="settings">
            <p className="text-muted-foreground text-sm pt-2">
              기본 설정을 관리합니다.
            </p>
          </TabsContent>
        </Tabs>
      </ShowcaseCard>

      <ShowcaseCard
        title="Tabs - Line"
        description="라인 스타일 탭 (밑줄 강조)"
      >
        <Tabs defaultValue="overview" className="w-full max-w-md">
          <TabsList variant="line">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
            <TabsTrigger value="reports">리포트</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="text-muted-foreground text-sm pt-2">
              프로젝트 개요를 확인합니다.
            </p>
          </TabsContent>
          <TabsContent value="analytics">
            <p className="text-muted-foreground text-sm pt-2">
              분석 데이터를 확인합니다.
            </p>
          </TabsContent>
          <TabsContent value="reports">
            <p className="text-muted-foreground text-sm pt-2">
              리포트를 확인합니다.
            </p>
          </TabsContent>
        </Tabs>
      </ShowcaseCard>

      <ShowcaseCard
        title="Breadcrumb"
        description="링크, 구분자, 현재 페이지, 말줄임"
      >
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">홈</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">문서</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>현재 페이지</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">홈</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbEllipsis />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">컴포넌트</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </ShowcaseCard>
    </div>
  )
}
