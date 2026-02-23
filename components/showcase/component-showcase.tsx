"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ButtonsBadgesSection } from "@/components/showcase/sections/buttons-badges"
import { FormElementsSection } from "@/components/showcase/sections/form-elements"
import { DataDisplaySection } from "@/components/showcase/sections/data-display"
import { OverlayFeedbackSection } from "@/components/showcase/sections/overlay-feedback"
import { NavigationSection } from "@/components/showcase/sections/navigation"
import { LayoutSection } from "@/components/showcase/sections/layout"

export function ComponentShowcase() {
  return (
    <Tabs defaultValue="buttons-badges">
      <TabsList variant="line" className="flex-wrap">
        <TabsTrigger value="buttons-badges">버튼 & 뱃지</TabsTrigger>
        <TabsTrigger value="form-elements">폼 요소</TabsTrigger>
        <TabsTrigger value="data-display">데이터 표시</TabsTrigger>
        <TabsTrigger value="overlay-feedback">오버레이 & 피드백</TabsTrigger>
        <TabsTrigger value="navigation">내비게이션</TabsTrigger>
        <TabsTrigger value="layout">레이아웃</TabsTrigger>
      </TabsList>
      <TabsContent value="buttons-badges">
        <ButtonsBadgesSection />
      </TabsContent>
      <TabsContent value="form-elements">
        <FormElementsSection />
      </TabsContent>
      <TabsContent value="data-display">
        <DataDisplaySection />
      </TabsContent>
      <TabsContent value="overlay-feedback">
        <OverlayFeedbackSection />
      </TabsContent>
      <TabsContent value="navigation">
        <NavigationSection />
      </TabsContent>
      <TabsContent value="layout">
        <LayoutSection />
      </TabsContent>
    </Tabs>
  )
}
