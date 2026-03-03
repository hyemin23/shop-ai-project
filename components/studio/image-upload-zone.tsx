"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Upload, X, RefreshCw, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { resizeToWebP } from "@/lib/image-resize";
import { IMAGE_CONSTRAINTS } from "@/config/studio";
import { Button } from "@/components/ui/button";

interface ImageUploadZoneProps {
  label: string;
  description?: string;
  accept?: string;
  className?: string;
  onFileSelect?: (file: File | null) => void;
}

export function ImageUploadZone({
  label,
  description,
  className,
  onFileSelect,
}: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);

  // cleanup object URL on unmount or preview change
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = useCallback(
    async (file: File) => {
      if (
        !(IMAGE_CONSTRAINTS.supportedFormats as readonly string[]).includes(
          file.type,
        )
      )
        return;
      if (file.size > IMAGE_CONSTRAINTS.maxSizeBytes) return;

      const optimized = await resizeToWebP(file);

      // 미리보기 URL 생성
      const url = URL.createObjectURL(optimized);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setFileName(file.name);

      onFileSelect?.(optimized);
    },
    [onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setFileName("");
      onFileSelect?.(null);
    },
    [preview, onFileSelect],
  );

  const handleReplace = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      inputRef.current?.click();
    },
    [],
  );

  // 미리보기 상태
  if (preview) {
    return (
      <div className={cn("relative overflow-hidden rounded-xl border bg-muted/30", className)}>
        <div className="relative h-64">
          <Image
            src={preview}
            alt={`${label} 미리보기`}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="flex items-center justify-between gap-2 border-t bg-background px-4 py-2.5">
          <p className="truncate text-sm text-muted-foreground">{fileName}</p>
          <div className="flex gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleReplace}
              className="hover:bg-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="sr-only">이미지 교체</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleRemove}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">이미지 제거</span>
            </Button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_CONSTRAINTS.supportedFormats.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    );
  }

  // 업로드 대기 상태
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "group flex h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/20 transition-all duration-200",
        isDragOver
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "hover:border-primary/50 hover:bg-muted/40",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/10">
        {isDragOver ? (
          <ImagePlus className="h-6 w-6 text-primary" />
        ) : (
          <Upload className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
        )}
      </div>
      <div className="text-center">
        <p className="font-medium">{label}</p>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP (최대 10MB)
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_CONSTRAINTS.supportedFormats.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
