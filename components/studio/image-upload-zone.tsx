"use client";

import { useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { resizeToWebP } from "@/lib/image-resize";
import { IMAGE_CONSTRAINTS } from "@/config/studio";

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
  onFileSelect,
}: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
      onFileSelect?.(optimized);
    },
    [onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
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
