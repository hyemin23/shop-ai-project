import { forwardRef } from "react";
import { OUTPUT_WIDTH } from "@/config/detail-page";

interface CatchphraseCardProps {
  catchphrase: string;
  description: string;
}

export const CatchphraseCard = forwardRef<HTMLDivElement, CatchphraseCardProps>(
  function CatchphraseCard({ catchphrase, description }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: OUTPUT_WIDTH,
          backgroundColor: "#ffffff",
          padding: "60px 80px",
          boxSizing: "border-box",
          textAlign: "center",
          fontFamily:
            "'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
        }}
      >
        {/* 장식 라인 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 1,
              height: 40,
              backgroundColor: "#ccc",
              marginBottom: 20,
            }}
          />
          <div
            style={{
              width: 60,
              height: 1,
              backgroundColor: "#ccc",
            }}
          />
        </div>

        {/* 캐치프레이즈 */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#1a1a1a",
            marginBottom: 20,
            lineHeight: 1.6,
          }}
        >
          {catchphrase}
        </div>

        {/* 상품 설명 */}
        <div
          style={{
            fontSize: 15,
            color: "#666",
            lineHeight: 1.8,
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          {description}
        </div>

        {/* 하단 장식 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 32,
          }}
        >
          <div
            style={{
              width: 60,
              height: 1,
              backgroundColor: "#ccc",
              marginBottom: 20,
            }}
          />
          <div
            style={{
              width: 1,
              height: 40,
              backgroundColor: "#ccc",
            }}
          />
        </div>
      </div>
    );
  },
);
