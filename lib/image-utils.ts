import { IMAGE_CONSTRAINTS } from "@/config/studio";
import { StudioError } from "@/lib/errors";

export interface ProcessedImage {
  base64: string;
  mimeType: string;
  buffer: Buffer;
  extension: string;
}

export function validateImageFile(file: File): void {
  if (
    !(IMAGE_CONSTRAINTS.supportedFormats as readonly string[]).includes(
      file.type,
    )
  ) {
    throw new StudioError("STUDIO_001");
  }

  if (file.size > IMAGE_CONSTRAINTS.maxSizeBytes) {
    throw new StudioError("STUDIO_002");
  }
}

export async function processImageFile(file: File): Promise<ProcessedImage> {
  validateImageFile(file);

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const extension =
    file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];

  return {
    base64,
    mimeType: file.type,
    buffer,
    extension,
  };
}

export function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, "base64");
}

export function getStoragePath(
  category: "source" | "result" | "thumb",
  sessionId: string,
  extension: string,
): string {
  const uuid = crypto.randomUUID();
  return `${category}/${sessionId}/${uuid}.${extension}`;
}
