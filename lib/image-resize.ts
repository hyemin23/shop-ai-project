const MAX_DIMENSION = 2048;
const QUALITY = 0.85;

export async function resizeToWebP(
  file: File,
  maxDim: number = MAX_DIMENSION,
): Promise<File> {
  // 서버 환경에서는 그대로 반환
  if (typeof window === "undefined") return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // 리사이즈 불필요
      if (width <= maxDim && height <= maxDim && file.type === "image/webp") {
        resolve(file);
        return;
      }

      // 비율 유지 리사이즈
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, "");
          const resizedFile = new File([blob], `${baseName}.webp`, {
            type: "image/webp",
          });
          resolve(resizedFile);
        },
        "image/webp",
        QUALITY,
      );
    };

    img.onerror = () => reject(new Error("이미지를 로드할 수 없습니다."));
    img.src = URL.createObjectURL(file);
  });
}
