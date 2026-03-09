import { forwardRef } from "react";
import { OUTPUT_WIDTH } from "@/config/detail-page";

interface FabricCardProps {
  fabric: string;
}

export const FabricCard = forwardRef<HTMLDivElement, FabricCardProps>(
  function FabricCard({ fabric }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: OUTPUT_WIDTH,
          backgroundColor: "#ffffff",
          padding: "50px 80px",
          boxSizing: "border-box",
          fontFamily:
            "'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          textAlign: "center",
        }}
      >
        {/* FABRIC 타이틀 */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.15em",
            marginBottom: 24,
            color: "#333",
          }}
        >
          FABRIC
        </div>

        {/* 소재 정보 */}
        <div
          style={{
            fontSize: 15,
            color: "#555",
            lineHeight: 1.8,
          }}
        >
          {fabric || "-"}
        </div>
      </div>
    );
  },
);
