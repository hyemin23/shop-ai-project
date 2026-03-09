"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Megaphone,
  Plus,
  Loader2,
  Power,
  PowerOff,
  Trash2,
  Info,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

interface Notice {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "maintenance";
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

const TYPE_CONFIG = {
  info: {
    label: "안내",
    icon: <Info className="h-3 w-3" />,
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  },
  warning: {
    label: "경고",
    icon: <AlertTriangle className="h-3 w-3" />,
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
  maintenance: {
    label: "점검",
    icon: <Wrench className="h-3 w-3" />,
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
  },
} as const;

export function NoticeManager() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/notices?all=true");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setNotices(data.notices ?? []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  async function toggleActive(notice: Notice) {
    try {
      const res = await fetch("/api/admin/notices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notice.id, is_active: !notice.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(notice.is_active ? "공지가 비활성화되었습니다." : "공지가 활성화되었습니다.");
        fetchNotices();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("오류가 발생했습니다.");
    }
  }

  async function deleteNotice(id: string) {
    try {
      const res = await fetch(`/api/admin/notices?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("공지가 삭제되었습니다.");
        fetchNotices();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("오류가 발생했습니다.");
    }
  }

  const activeNotice = notices.find((n) => n.is_active);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent" />
      <CardHeader className="relative flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
            <Megaphone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">서비스 공지</CardTitle>
            <p className="text-xs text-muted-foreground">
              {activeNotice ? "현재 활성 공지 있음" : "활성 공지 없음"}
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              새 공지
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 공지 등록</DialogTitle>
            </DialogHeader>
            <CreateNoticeForm
              onSuccess={() => {
                setDialogOpen(false);
                fetchNotices();
              }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="relative">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : notices.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            등록된 공지가 없습니다.
          </p>
        ) : (
          <div className="space-y-2">
            {notices.slice(0, 5).map((notice) => {
              const cfg = TYPE_CONFIG[notice.type] ?? TYPE_CONFIG.info;
              return (
                <div
                  key={notice.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    notice.is_active
                      ? "border-indigo-500/30 bg-indigo-500/5"
                      : "border-transparent bg-muted/30"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`gap-1 text-[10px] ${cfg.color}`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </Badge>
                      {notice.is_active && (
                        <Badge className="bg-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-300">
                          활성
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm font-medium">
                      {notice.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {notice.message}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => toggleActive(notice)}
                      title={notice.is_active ? "비활성화" : "활성화"}
                    >
                      {notice.is_active ? (
                        <PowerOff className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Power className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                      onClick={() => deleteNotice(notice.id)}
                      title="삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------

function CreateNoticeForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "maintenance">("info");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("제목과 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type,
          is_active: isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("공지가 등록되었습니다.");
        onSuccess();
      } else {
        toast.error(data.error || "등록에 실패했습니다.");
      }
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">유형</label>
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">
              <span className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-blue-500" /> 안내
              </span>
            </SelectItem>
            <SelectItem value="warning">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> 경고
              </span>
            </SelectItem>
            <SelectItem value="maintenance">
              <span className="flex items-center gap-2">
                <Wrench className="h-3.5 w-3.5 text-rose-500" /> 점검
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">제목</label>
        <Input
          placeholder="예: 서비스 점검 안내"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">내용</label>
        <Textarea
          placeholder="예: 3월 11일 02:00~04:00 서버 점검이 예정되어 있습니다."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is-active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="is-active" className="text-sm">
          즉시 활성화
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Megaphone className="mr-2 h-4 w-4" />
        )}
        공지 등록
      </Button>
    </form>
  );
}
