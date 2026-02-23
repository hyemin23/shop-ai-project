"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ShowcaseCard } from "@/components/showcase/showcase-card"

const formSchema = z.object({
  username: z.string().min(2, "2자 이상 입력하세요"),
  email: z.string().email("올바른 이메일을 입력하세요"),
  bio: z.string().max(100, "100자 이하로 입력하세요").optional(),
})

type FormValues = z.infer<typeof formSchema>

export function FormElementsSection() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      bio: "",
    },
  })

  function onSubmit(data: FormValues) {
    toast.success("폼이 제출되었습니다", {
      description: `사용자: ${data.username}, 이메일: ${data.email}`,
    })
  }

  return (
    <div className="space-y-6">
      <ShowcaseCard title="Input + Label" description="기본 입력 필드">
        <div className="space-y-4 max-w-sm">
          <div className="grid gap-2">
            <Label htmlFor="name">이름</Label>
            <Input id="name" placeholder="이름을 입력하세요" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email-basic">이메일</Label>
            <Input
              id="email-basic"
              type="email"
              placeholder="email@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="disabled">비활성화</Label>
            <Input id="disabled" disabled placeholder="비활성화된 입력" />
          </div>
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Textarea" description="여러 줄 텍스트 입력">
        <div className="max-w-sm grid gap-2">
          <Label htmlFor="message">메시지</Label>
          <Textarea id="message" placeholder="메시지를 입력하세요" />
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Select" description="드롭다운 선택">
        <div className="max-w-sm grid gap-2">
          <Label>카테고리</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="design">디자인</SelectItem>
              <SelectItem value="development">개발</SelectItem>
              <SelectItem value="marketing">마케팅</SelectItem>
              <SelectItem value="sales">영업</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Checkbox & Switch" description="토글 컨트롤">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">이용약관에 동의합니다</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="marketing" />
            <Label htmlFor="marketing">마케팅 수신 동의</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="notifications" />
            <Label htmlFor="notifications">알림 활성화</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="dark-mode" size="sm" />
            <Label htmlFor="dark-mode">다크 모드 (Small)</Label>
          </div>
        </div>
      </ShowcaseCard>

      <ShowcaseCard
        title="폼 검증"
        description="react-hook-form + zod 검증 데모"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-sm space-y-4"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사용자 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="홍길동" {...field} />
                  </FormControl>
                  <FormDescription>
                    2자 이상 입력하세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>소개</FormLabel>
                  <FormControl>
                    <Textarea placeholder="자기소개를 입력하세요" {...field} />
                  </FormControl>
                  <FormDescription>최대 100자</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">제출</Button>
          </form>
        </Form>
      </ShowcaseCard>
    </div>
  )
}
