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
