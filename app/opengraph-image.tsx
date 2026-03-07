import { ImageResponse } from "next/og";

export const alt = "똑픽 — AI 의류 이미지 편집 서비스";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "linear-gradient(135deg, #4F6EF7 0%, #6C5CE7 100%)",
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "white",
              lineHeight: 1,
            }}
          >
            똑
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            marginBottom: 16,
          }}
        >
          똑픽 (DDokPick)
        </div>

        {/* Description */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#a0a0cc",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          동대문 의류 셀러를 위한 AI 이미지 편집 서비스
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 40,
          }}
        >
          {["의류 교체", "색상 변경", "포즈 변경"].map((feature) => (
            <div
              key={feature}
              style={{
                display: "flex",
                padding: "10px 24px",
                borderRadius: 20,
                background: "rgba(79, 110, 247, 0.2)",
                border: "1px solid rgba(79, 110, 247, 0.4)",
                color: "#8b9cf7",
                fontSize: 22,
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
