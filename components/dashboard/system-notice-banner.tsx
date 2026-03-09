"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Info, Wrench, X } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "maintenance";
}

const NOTICE_STYLES = {
  info: {
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />,
    text: "text-blue-900 dark:text-blue-100",
  },
  warning: {
    bg: "bg-amber-500/10 border-amber-500/30",
    icon: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />,
    text: "text-amber-900 dark:text-amber-100",
  },
  maintenance: {
    bg: "bg-rose-500/10 border-rose-500/30",
    icon: <Wrench className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />,
    text: "text-rose-900 dark:text-rose-100",
  },
} as const;

export function SystemNoticeBanner() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotice() {
      try {
        const res = await fetch("/api/admin/notices");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.notice) {
          setNotice(data.notice);
        }
      } catch {
        // 조용히 실패
      }
    }
    fetchNotice();
    // 5분마다 갱신
    const interval = setInterval(fetchNotice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!notice || dismissed === notice.id) return null;

  const style = NOTICE_STYLES[notice.type] ?? NOTICE_STYLES.info;

  return (
    <div className={`flex items-start gap-3 border-b px-6 py-3 ${style.bg}`}>
      {style.icon}
      <div className={`min-w-0 flex-1 ${style.text}`}>
        <p className="text-sm font-semibold">{notice.title}</p>
        <p className="text-xs opacity-80">{notice.message}</p>
      </div>
      <button
        onClick={() => setDismissed(notice.id)}
        className="shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
        aria-label="공지 닫기"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
