import { forwardRef } from "react";
import { DETAIL_DISCLAIMER } from "@/config/product-info";

export const DetailHeaderCard = forwardRef<HTMLDivElement>(
  function DetailHeaderCard(_props, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: 860,
          backgroundColor: "#ffffff",
          padding: "50px 80px",
          fontFamily:
            "'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          color: "#1a1a1a",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        {/* DETAIL 라인 장식 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div
            style={{ flex: 1, height: 1, backgroundColor: "#999" }}
          />
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.35em",
              color: "#333",
              whiteSpace: "nowrap",
            }}
          >
            D E T A I L
          </div>
          <div
            style={{ flex: 1, height: 1, backgroundColor: "#999" }}
          />
        </div>

        {/* 면책 문구 */}
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.8,
            color: "#888",
          }}
        >
          {DETAIL_DISCLAIMER}
        </div>
      </div>
    );
  },
);
