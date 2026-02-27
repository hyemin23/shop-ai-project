import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DUMMY_HISTORY } from "@/lib/dummy-data";

const TYPE_LABELS: Record<string, string> = {
  "try-on": "의류 교체",
  "color-swap": "색상 변경",
  "pose-transfer": "포즈 변경",
};

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">작업 히스토리</h1>
        <p className="text-muted-foreground">
          이전에 생성한 이미지를 확인하고 관리합니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="try-on">의류 교체</SelectItem>
            <SelectItem value="color-swap">색상 변경</SelectItem>
            <SelectItem value="pose-transfer">포즈 변경</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="newest">
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">최신순</SelectItem>
            <SelectItem value="oldest">오래된순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {DUMMY_HISTORY.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">아직 생성한 이미지가 없습니다</p>
          <p className="text-sm text-muted-foreground mb-4">
            스튜디오에서 첫 번째 이미지를 생성해보세요
          </p>
          <Button asChild>
            <Link href="/dashboard/studio">스튜디오로 이동</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DUMMY_HISTORY.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-2 h-32">
                <div className="bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  Before
                </div>
                <div className="bg-muted flex items-center justify-center text-xs text-muted-foreground border-l">
                  After
                </div>
              </div>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{TYPE_LABELS[item.type]}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.mode === "premium" ? "고품질" : "기본"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{new Date(item.createdAt).toLocaleDateString("ko-KR")}</p>
                  <p>{(item.processingTime / 1000).toFixed(1)}초</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
