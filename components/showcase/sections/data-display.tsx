"use client"

import { InfoIcon, AlertTriangle } from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { ShowcaseCard } from "@/components/showcase/showcase-card"

const tableData = [
  { id: "INV-001", status: "완료", method: "신용카드", amount: "₩250,000" },
  { id: "INV-002", status: "대기", method: "계좌이체", amount: "₩150,000" },
  { id: "INV-003", status: "완료", method: "신용카드", amount: "₩350,000" },
  { id: "INV-004", status: "실패", method: "계좌이체", amount: "₩450,000" },
]

export function DataDisplaySection() {
  return (
    <div className="space-y-6">
      <ShowcaseCard
        title="Card 전체 구조"
        description="Header, Action, Content, Footer 포함"
      >
        <Card>
          <CardHeader>
            <CardTitle>프로젝트 요약</CardTitle>
            <CardDescription>
              이번 달 프로젝트 진행 현황입니다.
            </CardDescription>
            <CardAction>
              <Button variant="outline" size="sm">
                상세보기
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold">12</div>
                <div className="text-muted-foreground text-sm">진행 중</div>
              </div>
              <div className="flex-1 rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold">8</div>
                <div className="text-muted-foreground text-sm">완료</div>
              </div>
              <div className="flex-1 rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold">3</div>
                <div className="text-muted-foreground text-sm">보류</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              마지막 업데이트: 2시간 전
            </div>
          </CardFooter>
        </Card>
      </ShowcaseCard>

      <ShowcaseCard title="Table" description="샘플 데이터 테이블">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>주문 번호</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>결제 방법</TableHead>
              <TableHead className="text-right">금액</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      row.status === "완료"
                        ? "default"
                        : row.status === "대기"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>{row.method}</TableCell>
                <TableCell className="text-right">{row.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ShowcaseCard>

      <ShowcaseCard title="Accordion" description="FAQ 형태의 접기/펼치기">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>이 스타터킷은 무엇인가요?</AccordionTrigger>
            <AccordionContent>
              Next.js 기반의 풀스택 스타터킷으로, 인증, 대시보드, 마케팅
              페이지를 포함합니다.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>어떤 기술 스택을 사용하나요?</AccordionTrigger>
            <AccordionContent>
              Next.js, TypeScript, Tailwind CSS, Radix UI, React Hook Form,
              Zod 등을 사용합니다.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>라이선스는 어떻게 되나요?</AccordionTrigger>
            <AccordionContent>
              MIT 라이선스로 개인 및 상업적 프로젝트에 자유롭게 사용할 수
              있습니다.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ShowcaseCard>

      <ShowcaseCard title="Avatar" description="크기, 그룹, 뱃지">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar size="sm">
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="user" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarImage src="https://github.com/shadcn.png" alt="user" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <p className="text-muted-foreground mb-2 text-sm">Avatar Group</p>
            <AvatarGroup>
              <Avatar>
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <AvatarGroupCount>+5</AvatarGroupCount>
            </AvatarGroup>
          </div>
          <div>
            <p className="text-muted-foreground mb-2 text-sm">
              Avatar with Badge
            </p>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>ON</AvatarFallback>
                <AvatarBadge className="bg-green-500" />
              </Avatar>
              <Avatar size="lg">
                <AvatarFallback>OF</AvatarFallback>
                <AvatarBadge className="bg-gray-400" />
              </Avatar>
            </div>
          </div>
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Alert" description="알림 메시지">
        <div className="space-y-4">
          <Alert>
            <InfoIcon />
            <AlertTitle>안내</AlertTitle>
            <AlertDescription>
              시스템 점검이 예정되어 있습니다. 자세한 사항은 공지사항을
              확인하세요.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>
              요청을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.
            </AlertDescription>
          </Alert>
        </div>
      </ShowcaseCard>
    </div>
  )
}
