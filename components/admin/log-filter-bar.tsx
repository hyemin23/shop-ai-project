"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Search, X, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminLogsFilter } from "@/hooks/use-admin-logs";

interface LogFilterBarProps {
  filter: AdminLogsFilter;
  onFilterChange: (filter: Partial<AdminLogsFilter>) => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "전체 상태" },
  { value: "initiated", label: "시작됨" },
  { value: "processing", label: "처리중" },
  { value: "tokens_spent", label: "토큰차감" },
  { value: "succeed", label: "성공" },
  { value: "failed", label: "실패" },
  { value: "refunded", label: "환불됨" },
  { value: "abandoned", label: "중단됨" },
] as const;

const SERVICE_OPTIONS = [
  { value: "all", label: "전체 서비스" },
  { value: "studio", label: "스튜디오" },
  { value: "video", label: "비디오" },
] as const;

function toDateStr(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function parseDate(s: string | null): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d;
}

export function LogFilterBar({ filter, onFilterChange }: LogFilterBarProps) {
  const [localUserSearch, setLocalUserSearch] = useState(
    filter.userSearch ?? ""
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const today: Date = useMemo(() => new Date(), []);

  const dateRange: DateRange | undefined =
    filter.from
      ? {
          from: parseDate(filter.from),
          to: parseDate(filter.to) ?? parseDate(filter.from),
        }
      : undefined;

  const hasFilter =
    filter.status !== "all" ||
    filter.serviceType !== "all" ||
    !!filter.from ||
    !!filter.userSearch ||
    !!filter.userId;

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      onFilterChange({ from: null, to: null });
      return;
    }
    onFilterChange({
      from: toDateStr(range.from),
      to: range.to ? toDateStr(range.to) : toDateStr(range.from),
    });
  };

  const dateLabel = (() => {
    if (!filter.from) return "날짜 선택";
    const fromDate = parseDate(filter.from);
    const toDate = parseDate(filter.to);
    if (!fromDate) return "날짜 선택";

    const fromStr = format(fromDate, "M.d(EEE)", { locale: ko });
    if (!toDate || filter.from === filter.to) {
      return fromStr;
    }
    const toStr = format(toDate, "M.d(EEE)", { locale: ko });
    return `${fromStr} ~ ${toStr}`;
  })();

  return (
    <div className="space-y-2">
      {filter.userId && filter.userLabel && (
        <Badge
          variant="secondary"
          className="inline-flex items-center gap-1 px-3 py-1 text-sm"
        >
          {filter.userLabel}
          <button
            type="button"
            onClick={() => onFilterChange({ userId: null, userLabel: null })}
            className="ml-1 rounded-full p-0.5 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filter.status}
          onValueChange={(v) =>
            onFilterChange({ status: v as AdminLogsFilter["status"] })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filter.serviceType}
          onValueChange={(v) =>
            onFilterChange({
              serviceType: v as AdminLogsFilter["serviceType"],
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-9 min-w-[180px] justify-start gap-2 px-3 text-left text-sm font-normal",
                !filter.from && "text-muted-foreground"
              )}
            >
              <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{dateLabel}</span>
              {filter.from && (
                <X
                  className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterChange({ from: null, to: null });
                  }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="space-y-3 p-3">
              {/* Quick presets */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "오늘", days: 0 },
                  { label: "어제", days: 1 },
                  { label: "7일", days: 7 },
                  { label: "14일", days: 14 },
                  { label: "30일", days: 30 },
                ].map(({ label, days }) => (
                  <Button
                    key={label}
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full px-3 text-xs"
                    onClick={() => {
                      const now = new Date();
                      if (days === 0) {
                        const todayStr = toDateStr(now);
                        onFilterChange({ from: todayStr, to: todayStr });
                      } else if (days === 1) {
                        const yesterday = new Date(
                          now.getTime() - 86400000
                        );
                        const yStr = toDateStr(yesterday);
                        onFilterChange({ from: yStr, to: yStr });
                      } else {
                        const past = new Date(
                          now.getTime() - days * 86400000
                        );
                        onFilterChange({
                          from: toDateStr(past),
                          to: toDateStr(now),
                        });
                      }
                      setCalendarOpen(false);
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              <div className="border-t" />

              <Calendar
                mode="range"
                locale={ko}
                selected={dateRange}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                disabled={{ after: today }}
                defaultMonth={
                  dateRange?.from ??
                  new Date(today.getTime() - 30 * 86400000)
                }
              />
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-1">
          <Input
            type="text"
            placeholder="이메일/닉네임 검색"
            value={localUserSearch}
            onChange={(e) => setLocalUserSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                onFilterChange({ userSearch: localUserSearch || null });
            }}
            className="w-[200px]"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() =>
              onFilterChange({ userSearch: localUserSearch || null })
            }
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLocalUserSearch("");
              onFilterChange({
                status: "all",
                serviceType: "all",
                from: null,
                to: null,
                userSearch: null,
                userId: null,
                userLabel: null,
              });
            }}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            초기화
          </Button>
        )}
      </div>
    </div>
  );
}
