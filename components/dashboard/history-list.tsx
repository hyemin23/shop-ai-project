"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Download,
  ImageIcon,
  Loader2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { downloadImage } from "@/lib/download";
import { SERVICE_TYPE_LABELS as TYPE_LABELS, SERVICE_TYPE_COLORS as TYPE_COLORS } from "@/config/studio";
import { HistoryBatchCard } from "./history-batch-card";

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
type TypeGroupEntry = {
  type: "type-group";
  groupType: string;
  items: StudioHistoryItem[];
  totalTime: number;
};

type Entry = SingleEntry | TypeGroupEntry;

interface DateGroup {
  dateLabel: string;
  dateSublabel: string;
  entries: Entry[];
}

function groupItems(
  items: StudioHistoryItem[],
  sort: string,
): DateGroup[] {
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

    const entries: Entry[] = [];

    // 모든 아이템(배치 + 단건)을 type별로 합산 그룹핑
    const typeMap = new Map<string, StudioHistoryItem[]>();
    for (const batchItems of batchMap.values()) {
      const t = batchItems[0].type;
      const existing = typeMap.get(t);
      if (existing) existing.push(...batchItems);
      else typeMap.set(t, [...batchItems]);
    }
    for (const item of singles) {
      const existing = typeMap.get(item.type);
      if (existing) existing.push(item);
      else typeMap.set(item.type, [item]);
    }

    for (const [groupType, typeItems] of typeMap) {
      if (typeItems.length >= 2) {
        entries.push({
          type: "type-group",
          groupType,
          items: typeItems,
          totalTime: typeItems.reduce((sum, i) => sum + i.processingTime, 0),
        });
      } else {
        entries.push({ type: "single", item: typeItems[0] });
      }
    }

    entries.sort((a, b) => {
      const timeA =
        a.type === "single"
          ? new Date(a.item.createdAt).getTime()
          : new Date(a.items[0].createdAt).getTime();
      const timeB =
        b.type === "single"
          ? new Date(b.item.createdAt).getTime()
          : new Date(b.items[0].createdAt).getTime();
      return sort === "oldest" ? timeA - timeB : timeB - timeA;
    });

    const sublabel = getDateSublabel(dateItems[0].createdAt);
    groups.push({ dateLabel, dateSublabel: sublabel, entries });
  }

  const ORDER = ["오늘", "어제", "이번 주", "이번 달"];
  groups.sort((a, b) => {
    const idxA = ORDER.indexOf(a.dateLabel);
    const idxB = ORDER.indexOf(b.dateLabel);
    const orderA = idxA >= 0 ? idxA : 100;
    const orderB = idxB >= 0 ? idxB : 100;
    if (orderA !== orderB) return sort === "oldest" ? orderB - orderA : orderA - orderB;
    return sort === "oldest"
      ? a.dateLabel.localeCompare(b.dateLabel)
      : b.dateLabel.localeCompare(a.dateLabel);
  });

  return groups;
}

// --- 타입 Badge 컴포넌트 ---

function TypeBadge({ type }: { type: string }) {
  const colorClass = TYPE_COLORS[type] || "";
  return (
    <Badge
      variant="secondary"
      className={colorClass}
    >
      {TYPE_LABELS[type] ?? type}
    </Badge>
  );
}

type ViewMode = "grid" | "list";

// --- 날짜 그룹 섹션 (접기/펼치기) ---

function DateGroupSection({
  group,
  viewMode,
  openPreview,
  setDeleteTarget,
}: {
  group: DateGroup;
  viewMode: ViewMode;
  openPreview: (item: StudioHistoryItem, list?: StudioHistoryItem[]) => void;
  setDeleteTarget: (item: StudioHistoryItem) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const entryCount = group.entries.reduce((sum, e) =>
    e.type === "single" ? sum + 1 : sum + e.items.length, 0,
  );

  return (
    <section>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* 날짜 섹션 헤더 */}
        <CollapsibleTrigger asChild>
          <button className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 mb-3 border-b flex items-center gap-2 text-left group/header hover:bg-muted/50 transition-colors -mx-1 px-1 rounded-sm">
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
            />
            <h3 className="text-sm font-semibold text-foreground">
              {group.dateLabel}
              {group.dateSublabel && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({group.dateSublabel})
                </span>
              )}
            </h3>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {entryCount}건
            </span>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {/* 엔트리 목록 */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {group.entries.map((entry) => {
                if (entry.type === "type-group") {
                  return (
                    <div key={`tg-${entry.groupType}`} className="col-span-full">
                      <HistoryBatchCard
                        batchId={`type-${entry.groupType}`}
                        batchType={entry.groupType}
                        items={entry.items}
                        totalTime={entry.totalTime}
                        onDeleteItem={setDeleteTarget}
                        onPreviewItem={(item) => openPreview(item, entry.items)}
                      />
                    </div>
                  );
                }

                const item = entry.item;
                return (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover:shadow-md transition-shadow group relative"
                  >
                    {/* 타입 컬러 바 */}
                    <div className={`h-0.5 ${TYPE_COLORS[item.type]?.split(" ").find(c => c.startsWith("border-")) ? TYPE_COLORS[item.type].split(" ").find(c => c.startsWith("border-"))!.replace("border-", "bg-") : "bg-muted"}`} />

                    {/* After 이미지 (hover 시 Before로 전환) */}
                    <div
                      className="relative aspect-[3/4] bg-muted cursor-pointer overflow-hidden"
                      onClick={() => openPreview(item)}
                    >
                      {(item.resultThumbUrl || item.resultImageUrl) ? (
                        <Image
                          src={item.resultThumbUrl || item.resultImageUrl}
                          alt="결과 이미지"
                          fill
                          className="object-cover transition-opacity duration-200 group-hover:opacity-0"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                          결과 없음
                        </div>
                      )}

                      {(item.sourceThumbUrl || item.sourceImageUrl) && (
                        <Image
                          src={item.sourceThumbUrl || item.sourceImageUrl}
                          alt="원본 이미지"
                          fill
                          className="object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          unoptimized
                        />
                      )}

                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded transition-opacity group-hover:opacity-0">
                        After
                      </span>
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 transition-opacity group-hover:opacity-100">
                        Before
                      </span>

                      <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.resultImageUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 bg-black/40 text-white hover:text-white hover:bg-black/60"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(
                                item.resultImageUrl,
                                `${item.type}_${item.id.slice(0, 8)}.webp`,
                              );
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 bg-black/40 text-white hover:text-white hover:bg-black/60"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(item);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-2">
                      <div className="flex items-center justify-between gap-1">
                        <TypeBadge type={item.type} />
                        <span className="text-[11px] text-muted-foreground truncate">
                          {new Date(item.createdAt).toLocaleTimeString(
                            "ko-KR",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {group.entries.map((entry) => {
                if (entry.type === "type-group") {
                  return (
                    <HistoryBatchCard
                      key={`tg-${entry.groupType}`}
                      batchId={`type-${entry.groupType}`}
                      batchType={entry.groupType}
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
                      className="flex items-center gap-3 p-2 cursor-pointer"
                      onClick={() => openPreview(item)}
                    >
                      <div className="relative w-12 h-16 rounded overflow-hidden bg-muted shrink-0">
                        {(item.resultThumbUrl || item.resultImageUrl) && (
                          <Image
                            src={item.resultThumbUrl || item.resultImageUrl}
                            alt="결과"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <TypeBadge type={item.type} />
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
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
                      </div>

                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {item.resultImageUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(
                                item.resultImageUrl,
                                `${item.type}_${item.id.slice(0, 8)}.webp`,
                              );
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(item);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
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
  const [previewTab, setPreviewTab] = useState<"after" | "before">("after");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const limit = 20;
  const abortRef = useRef<AbortController | null>(null);

  const openPreview = useCallback((item: StudioHistoryItem, list?: StudioHistoryItem[]) => {
    setPreviewItem(item);
    setPreviewList(list || []);
    setPreviewTab("after");
  }, []);

  const navigatePreview = useCallback((dir: -1 | 1) => {
    if (!previewItem || previewList.length === 0) return;
    const idx = previewList.findIndex((i) => i.id === previewItem.id);
    const next = idx + dir;
    if (next >= 0 && next < previewList.length) {
      setPreviewItem(previewList[next]);
      setPreviewTab("after");
    }
  }, [previewItem, previewList]);

  const previewIndex = previewItem ? previewList.findIndex((i) => i.id === previewItem.id) : -1;

  // 키보드 네비게이션
  useEffect(() => {
    if (!previewItem || previewList.length <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigatePreview(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigatePreview(1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previewItem, previewList, navigatePreview]);

  const fetchHistory = useCallback(
    async (reset = false) => {
      if (!user) return;

      // Cancel previous in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      const currentOffset = reset ? 0 : offset;

      try {
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(currentOffset),
          sort,
        });
        if (typeFilter !== "all") params.set("type", typeFilter);

        const res = await fetch(`/api/history?${params}`, {
          signal: controller.signal,
        });
        if (res.ok && !controller.signal.aborted) {
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
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        toast.error("히스토리를 불러오지 못했습니다.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
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

        {/* 뷰 모드 전환 */}
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

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
            <DateGroupSection
              key={group.dateLabel}
              group={group}
              viewMode={viewMode}
              openPreview={openPreview}
              setDeleteTarget={setDeleteTarget}
            />
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
        <DialogContent
          className="sm:max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            이미지 미리보기
          </DialogTitle>
          {previewItem && (
            <>
              {/* 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <TypeBadge type={previewItem.type} />
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

              {/* After / Before 탭 전환 이미지 */}
              <div className="relative flex-1 min-h-0 bg-muted">
                {/* 이미지 영역 */}
                <div className="relative w-full h-full flex items-center justify-center" style={{ minHeight: "400px", maxHeight: "calc(90vh - 120px)" }}>
                  {previewTab === "after" ? (
                    (previewItem.resultThumbUrl || previewItem.resultImageUrl) ? (
                      <Image
                        src={(previewItem.resultImageUrl || previewItem.resultThumbUrl)!}
                        alt="결과 이미지"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        결과 없음
                      </div>
                    )
                  ) : (
                    (previewItem.sourceThumbUrl || previewItem.sourceImageUrl) ? (
                      <Image
                        src={(previewItem.sourceImageUrl || previewItem.sourceThumbUrl)!}
                        alt="원본 이미지"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        원본 없음
                      </div>
                    )
                  )}
                </div>

                {/* 오버레이 탭 전환 pill */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex bg-black/70 rounded-full p-0.5 backdrop-blur-sm">
                  <button
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      previewTab === "after"
                        ? "bg-white text-black"
                        : "text-white/70 hover:text-white"
                    }`}
                    onClick={() => setPreviewTab("after")}
                  >
                    After
                  </button>
                  <button
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      previewTab === "before"
                        ? "bg-white text-black"
                        : "text-white/70 hover:text-white"
                    }`}
                    onClick={() => setPreviewTab("before")}
                  >
                    Before
                  </button>
                </div>
              </div>

              {/* 하단 네비게이션 바 */}
              {previewList.length > 1 && (
                <div className="flex items-center justify-center gap-3 px-4 py-2.5 border-t shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={previewIndex <= 0}
                    onClick={() => navigatePreview(-1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    이전
                  </Button>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {previewIndex + 1} / {previewList.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={previewIndex >= previewList.length - 1}
                    onClick={() => navigatePreview(1)}
                  >
                    다음
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
