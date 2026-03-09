"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
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
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Video,
  Loader2,
  Play,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { downloadVideo } from "@/lib/download";

interface VideoHistoryItem {
  id: string;
  action: string;
  videoUrl: string | null;
  sourceImageUrl: string | null;
  prompt: string | null;
  duration: string | null;
  mode: string | null;
  tokensCharged: number;
  createdAt: string;
  completedAt: string | null;
}

export function VideoHistoryList() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<VideoHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [previewItem, setPreviewItem] = useState<VideoHistoryItem | null>(null);
  const limit = 20;

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

        const res = await fetch(`/api/video/history?${params}`);
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
        toast.error("비디오 히스토리를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [user, offset, sort],
  );

  useEffect(() => {
    fetchHistory(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sort]);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownload(item: VideoHistoryItem) {
    if (!item.videoUrl) {
      toast.error("다운로드 링크가 만료되었습니다.");
      return;
    }
    setDownloadingId(item.id);
    try {
      await downloadVideo(
        item.videoUrl,
        `video_${item.id.slice(0, 8)}.mp4`,
      );
    } catch {
      toast.error("다운로드에 실패했습니다.");
    } finally {
      setDownloadingId(null);
    }
  }

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
        <Video className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">로그인이 필요합니다</p>
        <p className="text-sm text-muted-foreground mb-4">
          로그인 후 비디오 히스토리를 확인할 수 있습니다.
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
          <Video className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">아직 생성한 영상이 없습니다</p>
          <p className="text-sm text-muted-foreground mb-4">
            상품 영상 생성에서 첫 번째 영상을 만들어보세요
          </p>
          <Button asChild>
            <Link href="/dashboard/video/image-to-video">영상 생성하기</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-4 p-4">
                {/* 소스 이미지 썸네일 */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                  {item.sourceImageUrl ? (
                    <Image
                      src={item.sourceImageUrl}
                      alt="소스 이미지"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Video className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="secondary"
                      className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                    >
                      상품 영상
                    </Badge>
                    {item.duration && (
                      <span className="text-xs text-muted-foreground">
                        {item.duration}초
                      </span>
                    )}
                    {item.mode && (
                      <span className="text-xs text-muted-foreground">
                        {item.mode === "pro" ? "고품질" : "표준"}
                      </span>
                    )}
                  </div>
                  {item.prompt && (
                    <p className="text-xs text-muted-foreground truncate max-w-md">
                      {item.prompt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>{item.tokensCharged} 토큰</span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-1 shrink-0">
                  {item.videoUrl && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-primary"
                        onClick={() => setPreviewItem(item)}
                        title="미리보기"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-primary"
                        onClick={() => handleDownload(item)}
                        disabled={downloadingId === item.id}
                        title="다운로드"
                      >
                        {downloadingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                  {!item.videoUrl && (
                    <span className="text-xs text-muted-foreground self-center">
                      링크 만료
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
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

      {/* 비디오 미리보기 모달 */}
      <Dialog
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      >
        <DialogContent
          className="sm:max-w-2xl p-0 gap-0 overflow-hidden"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">비디오 미리보기</DialogTitle>
          {previewItem && (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                  >
                    상품 영상
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(previewItem.createdAt).toLocaleString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {previewItem.videoUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(previewItem)}
                      disabled={downloadingId === previewItem.id}
                    >
                      {downloadingId === previewItem.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
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

              <div className="bg-black">
                {previewItem.videoUrl ? (
                  <video
                    src={previewItem.videoUrl}
                    controls
                    autoPlay
                    className="w-full max-h-[70vh]"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-white/50">
                    비디오 링크가 만료되었습니다
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
