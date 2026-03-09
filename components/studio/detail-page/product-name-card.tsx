import { forwardRef } from "react";
import { OUTPUT_WIDTH } from "@/config/detail-page";

interface ProductNameCardProps {
  subtitle: string;
  productName: string;
}

export const ProductNameCard = forwardRef<HTMLDivElement, ProductNameCardProps>(
  function ProductNameCard({ subtitle, productName }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: OUTPUT_WIDTH,
          backgroundColor: "#ffffff",
          padding: "80px 80px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        {/* 영문 서브타이틀 (이탤릭) */}
        <div
          style={{
            fontSize: 16,
            fontStyle: "italic",
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: "#888",
            letterSpacing: "0.05em",
            marginBottom: 16,
          }}
        >
          {subtitle}
        </div>

        {/* 영문 상품명 (대문자, 세리프, 굵게) */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: "#1a1a1a",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            lineHeight: 1.3,
          }}
        >
          {productName}
        </div>
      </div>
    );
  },
);
