"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { type StudioHistoryItem } from "@/types/studio";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, ImageIcon, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { downloadImage } from "@/lib/download";

const TYPE_LABELS: Record<string, string> = {
  "try-on": "의류 교체",
  "color-swap": "색상 변경",
  "pose-transfer": "포즈 변경",
  "background-swap": "배경 변경",
  "multi-pose": "멀티포즈",
  "detail-extract": "상세 추출",
  "auto-fitting": "자동피팅",
};

export function HistoryList() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<StudioHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<StudioHistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const limit = 12;

  const fetchHistory = useCallback(
    async (reset = false) => {
      if (!user) return;
      setIsLoading(true);
      const currentOffset = reset ? 0 : offset;

      try {
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(currentOffset),
          sort,
        });
        if (typeFilter !== "all") params.set("type", typeFilter);

        const res = await fetch(`/api/history?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (reset) {
            setItems(data.items);
            setOffset(data.items.length);
          } else {
            setItems((prev) => [...prev, ...data.items]);
            setOffset((prev) => prev + data.items.length);
          }
          setTotal(data.total);
          setHasMore(currentOffset + data.items.length < data.total);
        }
      } catch {
        toast.error("히스토리를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, offset, typeFilter, sort],
  );

  useEffect(() => {
    fetchHistory(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, typeFilter, sort]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/history?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        setTotal((prev) => prev - 1);
        toast.success("히스토리가 삭제되었습니다.");
      } else {
        toast.error("삭제에 실패했습니다.");
      }
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">로그인이 필요합니다</p>
        <p className="text-sm text-muted-foreground mb-4">
          로그인 후 작업 히스토리를 확인할 수 있습니다.
        </p>
        <Button asChild>
          <Link href="/login">로그인</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">최신순</SelectItem>
            <SelectItem value="oldest">오래된순</SelectItem>
          </SelectContent>
        </Select>

        {total > 0 && (
          <span className="text-sm text-muted-foreground ml-auto">
            총 {total}건
          </span>
        )}
      </div>

      {items.length === 0 && !isLoading ? (
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
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="grid grid-cols-2 h-40 relative">
                  <div className="relative bg-muted">
                    {item.sourceThumbUrl || item.sourceImageUrl ? (
                      <Image
                        src={item.sourceThumbUrl || item.sourceImageUrl}
                        alt="원본 이미지"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        Before
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Before
                    </span>
                  </div>
                  <div className="relative bg-muted border-l">
                    {item.resultThumbUrl || item.resultImageUrl ? (
                      <Image
                        src={item.resultThumbUrl || item.resultImageUrl}
                        alt="결과 이미지"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        After
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                      After
                    </span>
                  </div>
                </div>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {TYPE_LABELS[item.type] ?? item.type}
                    </Badge>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.resultImageUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() =>
                            downloadImage(
                              item.resultImageUrl,
                              `${item.type}_${item.id.slice(0, 8)}.webp`,
                            )
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span>{(item.processingTime / 1000).toFixed(1)}초</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchHistory(false)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                더 보기
              </Button>
            </div>
          )}
        </>
      )}

      {isLoading && items.length === 0 && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>히스토리 삭제</DialogTitle>
            <DialogDescription>
              이 작업 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
