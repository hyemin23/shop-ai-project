import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "linear-gradient(135deg, #4F6EF7 0%, #6C5CE7 100%)",
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "white",
            lineHeight: 1,
          }}
        >
          똑
        </span>
      </div>
    ),
    { ...size },
  );
}
