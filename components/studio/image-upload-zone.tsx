// 이미지 업로드 드래그앤드롭 영역 컴포넌트
"use client";

import { Upload } from "lucide-react";

import { cn } from "@/lib/utils";

interface ImageUploadZoneProps {
  label: string;
  description?: string;
  accept?: string;
  className?: string;
  onFileSelect?: (file: File) => void;
}

export function ImageUploadZone({
  label,
  description,
  className,
}: ImageUploadZoneProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {}}
      onKeyDown={() => {}}
      onDragOver={() => {}}
      onDrop={() => {}}
      className={cn(
        "flex h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors hover:border-primary",
        className,
      )}
    >
      <Upload className="h-10 w-10 text-muted-foreground" />
      <p className="font-medium">{label}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP (최대 10MB)
      </p>
    </div>
  );
}
