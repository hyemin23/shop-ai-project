"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Download, ImageIcon, Loader2, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { downloadImage } from "@/lib/download";
import { HistoryBatchCard } from "./history-batch-card";

const TYPE_LABELS: Record<string, string> = {
  "try-on": "의류 교체",
  "color-swap": "색상 변경",
  "pose-transfer": "포즈 변경",
  "background-swap": "배경 변경",
  "multi-pose": "멀티포즈",
  "detail-extract": "상세 추출",
  "auto-fitting": "자동피팅",
};

// --- 날짜 그룹핑 유틸 ---

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  if (isSameDay(date, now)) return "오늘";
  if (isSameDay(date, yesterday)) return "어제";
  if (date >= weekAgo) return "이번 주";

  // 이번 달 체크
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  ) {
    return "이번 달";
  }

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });
}

function getDateSublabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  if (isSameDay(date, now)) {
    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
  }
  if (
    isSameDay(
      date,
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    )
  ) {
    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
  }
  return "";
}

type SingleEntry = { type: "single"; item: StudioHistoryItem };
type BatchEntry = {
  type: "batch";
  batchId: string;
  batchType: string;
  items: StudioHistoryItem[];
  totalTime: number;
};

interface DateGroup {
  dateLabel: string;
  dateSublabel: string;
  entries: (SingleEntry | BatchEntry)[];
}

function groupItems(
  items: StudioHistoryItem[],
  sort: string,
): DateGroup[] {
  // 1. 날짜별 분류
  const dateMap = new Map<string, StudioHistoryItem[]>();
  for (const item of items) {
    const label = getDateLabel(item.createdAt);
    const existing = dateMap.get(label);
    if (existing) {
      existing.push(item);
    } else {
      dateMap.set(label, [item]);
    }
  }

  // 2. 각 날짜 내에서 배치 그룹핑
  const groups: DateGroup[] = [];
  for (const [dateLabel, dateItems] of dateMap) {
    const batchMap = new Map<string, StudioHistoryItem[]>();
    const singles: StudioHistoryItem[] = [];

    for (const item of dateItems) {
      if (item.batchId) {
        const existing = batchMap.get(item.batchId);
        if (existing) {
          existing.push(item);
        } else {
          batchMap.set(item.batchId, [item]);
        }
      } else {
        singles.push(item);
      }
    }

    // 엔트리 구성: 배치 + 단일을 시간순 정렬
    const entries: (SingleEntry | BatchEntry)[] = [];

    for (const [batchId, batchItems] of batchMap) {
      entries.push({
        type: "batch",
        batchId,
        batchType: batchItems[0].type,
        items: batchItems,
        totalTime: batchItems.reduce((sum, i) => sum + i.processingTime, 0),
      });
    }

    for (const item of singles) {
      entries.push({ type: "single", item });
    }

    // 엔트리를 첫 번째 항목의 시간순으로 정렬
    entries.sort((a, b) => {
      const timeA =
        a.type === "batch"
          ? new Date(a.items[0].createdAt).getTime()
          : new Date(a.item.createdAt).getTime();
      const timeB =
        b.type === "batch"
          ? new Date(b.items[0].createdAt).getTime()
          : new Date(b.item.createdAt).getTime();
      return sort === "oldest" ? timeA - timeB : timeB - timeA;
    });

    const sublabel = getDateSublabel(dateItems[0].createdAt);
    groups.push({ dateLabel, dateSublabel: sublabel, entries });
  }

  // 날짜 그룹 정렬 순서 정의
  const ORDER = ["오늘", "어제", "이번 주", "이번 달"];
  groups.sort((a, b) => {
    const idxA = ORDER.indexOf(a.dateLabel);
    const idxB = ORDER.indexOf(b.dateLabel);
    const orderA = idxA >= 0 ? idxA : 100;
    const orderB = idxB >= 0 ? idxB : 100;
    if (orderA !== orderB) return sort === "oldest" ? orderB - orderA : orderA - orderB;
    // 둘 다 커스텀 레이블인 경우 문자열 비교
    return sort === "oldest"
      ? a.dateLabel.localeCompare(b.dateLabel)
      : b.dateLabel.localeCompare(a.dateLabel);
  });

  return groups;
}

// --- 컴포넌트 ---

export function HistoryList() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<StudioHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<StudioHistoryItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewItem, setPreviewItem] = useState<StudioHistoryItem | null>(null);
  const [previewList, setPreviewList] = useState<StudioHistoryItem[]>([]);
  const limit = 20;

  const openPreview = useCallback((item: StudioHistoryItem, list?: StudioHistoryItem[]) => {
    setPreviewItem(item);
    setPreviewList(list || []);
  }, []);

  const navigatePreview = useCallback((dir: -1 | 1) => {
    if (!previewItem || previewList.length === 0) return;
    const idx = previewList.findIndex((i) => i.id === previewItem.id);
    const next = idx + dir;
    if (next >= 0 && next < previewList.length) {
      setPreviewItem(previewList[next]);
    }
  }, [previewItem, previewList]);

  const previewIndex = previewItem ? previewList.findIndex((i) => i.id === previewItem.id) : -1;

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

  const dateGroups = useMemo(
    () => groupItems(items, sort),
    [items, sort],
  );

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
        <div className="space-y-6">
          {dateGroups.map((group) => (
            <section key={group.dateLabel}>
              {/* 날짜 섹션 헤더 */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 mb-3 border-b">
                <h3 className="text-sm font-semibold text-foreground">
                  {group.dateLabel}
                  {group.dateSublabel && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ({group.dateSublabel})
                    </span>
                  )}
                </h3>
              </div>

              {/* 엔트리 목록 */}
              <div className="space-y-3">
                {group.entries.map((entry) => {
                  if (entry.type === "batch") {
                    return (
                      <HistoryBatchCard
                        key={entry.batchId}
                        batchId={entry.batchId}
                        batchType={entry.batchType}
                        items={entry.items}
                        totalTime={entry.totalTime}
                        onDeleteItem={setDeleteTarget}
                        onPreviewItem={(item) => openPreview(item, entry.items)}
                      />
                    );
                  }

                  const item = entry.item;
                  return (
                    <Card
                      key={item.id}
                      className="overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      <div
                        className="grid grid-cols-2 cursor-pointer"
                        onClick={() => openPreview(item)}
                      >
                        <div className="relative aspect-[3/4] bg-muted">
                          {item.sourceThumbUrl || item.sourceImageUrl ? (
                            <Image
                              src={item.sourceThumbUrl || item.sourceImageUrl}
                              alt="원본 이미지"
                              fill
                              className="object-contain"
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
                        <div className="relative aspect-[3/4] bg-muted border-l">
                          {item.resultThumbUrl || item.resultImageUrl ? (
                            <Image
                              src={item.resultThumbUrl || item.resultImageUrl}
                              alt="결과 이미지"
                              fill
                              className="object-contain"
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
                            {new Date(item.createdAt).toLocaleTimeString(
                              "ko-KR",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                          <span>
                            {(item.processingTime / 1000).toFixed(1)}초
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}

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
        </div>
      )}

      {isLoading && items.length === 0 && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
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

      {/* 이미지 미리보기 모달 */}
      <Dialog
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">
            이미지 미리보기
          </DialogTitle>
          {previewItem && (
            <>
              {/* 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {TYPE_LABELS[previewItem.type] ?? previewItem.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(previewItem.createdAt).toLocaleString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(previewItem.processingTime / 1000).toFixed(1)}초
                  </span>
                  {previewList.length > 1 && (
                    <span className="text-xs text-muted-foreground">
                      {previewIndex + 1} / {previewList.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {previewItem.resultImageUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        downloadImage(
                          previewItem.resultImageUrl,
                          `${previewItem.type}_${previewItem.id.slice(0, 8)}.webp`,
                        )
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPreviewItem(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Before / After 비교 */}
              <div className="grid grid-cols-2 gap-0 overflow-auto max-h-[calc(90vh-60px)]">
                <div className="relative bg-muted flex flex-col items-center">
                  <span className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    Before
                  </span>
                  <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
                    {(previewItem.sourceThumbUrl || previewItem.sourceImageUrl) ? (
                      <Image
                        src={previewItem.sourceImageUrl}
                        alt="원본 이미지"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        원본 없음
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative bg-muted border-l flex flex-col items-center">
                  <span className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    After
                  </span>
                  <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
                    {(previewItem.resultThumbUrl || previewItem.resultImageUrl) ? (
                      <Image
                        src={previewItem.resultImageUrl}
                        alt="결과 이미지"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        결과 없음
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 배치 내 이전/다음 네비게이션 */}
              {previewList.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 shadow-md hover:bg-background disabled:opacity-30"
                    disabled={previewIndex <= 0}
                    onClick={() => navigatePreview(-1)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 shadow-md hover:bg-background disabled:opacity-30"
                    disabled={previewIndex >= previewList.length - 1}
                    onClick={() => navigatePreview(1)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
