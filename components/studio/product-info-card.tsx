import { forwardRef } from "react";
import { type ProductInfoFormData } from "@/types/product-info";

interface ProductInfoCardProps {
  data: ProductInfoFormData;
}

export const ProductInfoCard = forwardRef<HTMLDivElement, ProductInfoCardProps>(
  function ProductInfoCard({ data }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: 860,
          backgroundColor: "#ffffff",
          padding: "60px 80px",
          fontFamily:
            "'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          color: "#1a1a1a",
          boxSizing: "border-box",
        }}
      >
        {/* PRODUCT INFO 타이틀 */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.15em",
            marginBottom: 36,
            color: "#333",
            textAlign: "center",
          }}
        >
          PRODUCT INFO
        </div>

        {/* COLOR */}
        <Section label="COLOR" value={data.colors || "-"} />

        {/* SIZE */}
        <Section label="SIZE" value={data.sizes || "-"} />

        {/* MODEL INFO */}
        <Section
          label="MODEL INFO"
          value={
            data.modelHeight || data.modelWeight
              ? `${data.modelHeight ? `${data.modelHeight}cm` : ""}${data.modelHeight && data.modelWeight ? ", " : ""}${data.modelWeight ? `${data.modelWeight}kg` : ""}${data.modelTopSize ? `, 평소상의 ${data.modelTopSize} size` : ""}${data.modelBottomSize ? `, 평소하의 ${data.modelBottomSize} size` : ""}`
              : "-"
          }
        />

        {/* FITTING COLOR & SIZE */}
        <div style={{ marginBottom: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.08em",
              marginBottom: 10,
              color: "#333",
            }}
          >
            FITTING COLOR / SIZE
          </div>
          <div
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: "#555",
            }}
          >
            {data.fittingColors || data.fittingSize
              ? `${data.fittingColors || ""}${data.fittingColors && data.fittingSize ? " / " : ""}${data.fittingSize ? `${data.fittingSize} size 착용` : ""}`
              : "-"}
          </div>
        </div>
      </div>
    );
  },
);

function Section({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.08em",
          marginBottom: 10,
          color: "#333",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.8,
          color: "#555",
        }}
      >
        {value}
      </div>
    </div>
  );
}
