/**
 * 외부 URL 이미지를 fetch → blob → 다운로드하는 유틸리티.
 * <a download>는 cross-origin URL에서 동작하지 않으므로 이 방식을 사용.
 */
export async function downloadImage(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

/**
 * 외부 URL 비디오를 fetch → blob → 즉시 다운로드.
 */
export async function downloadVideo(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

interface ZipItem {
  url: string;
  fileName: string;
}

export async function downloadAsZip(
  items: ZipItem[],
  zipName: string,
): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  await Promise.all(
    items.map(async ({ url, fileName }) => {
      const res = await fetch(url);
      const blob = await res.blob();
      const ext =
        blob.type.split("/")[1] === "jpeg"
          ? "jpg"
          : blob.type.split("/")[1] || "png";
      zip.file(`${fileName}.${ext}`, blob);
    }),
  );

  const content = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(content);
  a.download = zipName;
  a.click();
  URL.revokeObjectURL(a.href);
}
