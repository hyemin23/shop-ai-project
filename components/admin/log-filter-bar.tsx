"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw, Search } from "lucide-react";
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

export function LogFilterBar({ filter, onFilterChange }: LogFilterBarProps) {
  const [localUserSearch, setLocalUserSearch] = useState(filter.userSearch ?? "");

  const hasFilter =
    filter.status !== "all" || filter.serviceType !== "all" || !!filter.from || !!filter.userSearch;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filter.status}
        onValueChange={(v) => onFilterChange({ status: v as AdminLogsFilter["status"] })}
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
          onFilterChange({ serviceType: v as AdminLogsFilter["serviceType"] })
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

      <Input
        type="date"
        value={filter.from ?? ""}
        onChange={(e) => onFilterChange({ from: e.target.value || null })}
        className="w-[160px]"
      />

      <div className="flex items-center gap-1">
        <Input
          type="text"
          placeholder="이메일/닉네임 검색"
          value={localUserSearch}
          onChange={(e) => setLocalUserSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onFilterChange({ userSearch: localUserSearch || null });
          }}
          className="w-[200px]"
        />
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => onFilterChange({ userSearch: localUserSearch || null })}
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
            onFilterChange({ status: "all", serviceType: "all", from: null, userSearch: null });
          }}
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          초기화
        </Button>
      )}
    </div>
  );
}
