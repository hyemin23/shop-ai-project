import { forwardRef } from "react";
import { OUTPUT_WIDTH } from "@/config/detail-page";
import type { DetailPageFeature } from "@/types/detail-page";

interface FeaturesCardProps {
  features: DetailPageFeature[];
}

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`;

function sanitizeSvg(svg: string): string {
  // 기본 검증: <svg 태그가 포함되어 있는지
  if (!svg || !svg.includes("<svg")) return FALLBACK_SVG;
  // script 태그 제거
  return svg.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
}

export const FeaturesCard = forwardRef<HTMLDivElement, FeaturesCardProps>(
  function FeaturesCard({ features }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: OUTPUT_WIDTH,
          backgroundColor: "#ffffff",
          padding: "60px 80px",
          boxSizing: "border-box",
          fontFamily:
            "'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
        }}
      >
        {/* 2x2 그리드 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px 60px",
          }}
        >
          {features.slice(0, 4).map((feature, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "20px 10px",
              }}
            >
              {/* SVG 아이콘 */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  color: "#333",
                }}
                dangerouslySetInnerHTML={{
                  __html: sanitizeSvg(feature.svgIcon),
                }}
              />

              {/* 특징명 */}
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1a1a1a",
                  marginBottom: 8,
                }}
              >
                {feature.title}
              </div>

              {/* 설명 */}
              <div
                style={{
                  fontSize: 14,
                  color: "#777",
                  lineHeight: 1.6,
                }}
              >
                {feature.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);
