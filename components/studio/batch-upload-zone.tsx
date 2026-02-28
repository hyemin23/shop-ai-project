"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IMAGE_CONSTRAINTS } from "@/config/studio";

interface BatchUploadZoneProps {
  maxFiles?: number;
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

export function BatchUploadZone({
  maxFiles = 10,
  files,
  onFilesChange,
  disabled,
  className,
}: BatchUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const validFiles = Array.from(newFiles).filter((file) => {
        if (
          !(IMAGE_CONSTRAINTS.supportedFormats as readonly string[]).includes(
            file.type,
          )
        )
          return false;
        if (file.size > IMAGE_CONSTRAINTS.maxSizeBytes) return false;
        return true;
      });

      const combined = [...files, ...validFiles].slice(0, maxFiles);
      onFilesChange(combined);
    },
    [files, maxFiles, onFilesChange],
  );

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!disabled) addFiles(e.dataTransfer.files);
    },
    [disabled, addFiles],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
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
          "flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "hover:border-primary",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          이미지를 드래그하거나 클릭하여 업로드
        </p>
        <p className="text-xs text-muted-foreground">
          최대 {maxFiles}장 · JPG, PNG, WebP (각 최대 10MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_CONSTRAINTS.supportedFormats.join(",")}
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {files.length}/{maxFiles}장 선택됨
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
              >
                <ImageIcon className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="relative h-full w-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-1 top-1 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
                <p className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[10px] text-white">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
