import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
          background: "linear-gradient(135deg, #4F6EF7 0%, #6C5CE7 100%)",
        }}
      >
        <span
          style={{
            fontSize: 110,
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
