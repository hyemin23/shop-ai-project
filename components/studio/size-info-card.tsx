import { forwardRef } from "react";
import { type ProductInfoFormData } from "@/types/product-info";
import { SIZE_DISCLAIMER } from "@/config/product-info";

interface SizeInfoCardProps {
  data: ProductInfoFormData;
}

export const SizeInfoCard = forwardRef<HTMLDivElement, SizeInfoCardProps>(
  function SizeInfoCard({ data }, ref) {
    const hasModelInfo =
      data.modelHeight || data.modelWeight || data.fittingSize;

    const modelText = hasModelInfo
      ? `${data.fittingSize ? `${data.fittingSize} Size` : ""}${data.fittingColors ? `, ${data.fittingColors} 착용` : ""}${data.modelHeight ? ` (${data.modelHeight}cm` : ""}${data.modelWeight ? `, ${data.modelWeight}kg` : ""}${data.modelTopSize ? `, 상의 ${data.modelTopSize}` : ""}${data.modelBottomSize ? `, 하의 ${data.modelBottomSize}` : ""}${data.modelHeight ? ")" : ""}`
      : "-";

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
        }}
      >
        {/* SIZE INFO 타이틀 */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.1em",
            marginBottom: 28,
            color: "#333",
          }}
        >
          SIZE INFO
        </div>

        {/* 메타 정보 */}
        <div style={{ marginBottom: 28 }}>
          <InfoRow label="FABRIC" value={data.fabric || "-"} />
          <InfoRow label="COLOR" value={data.colors || "-"} />
          <InfoRow label="MODEL" value={modelText} />
        </div>

        {/* 실측 테이블 */}
        {data.sizeRows.length > 0 && data.measurementLabels.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 20,
              fontSize: 14,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    backgroundColor: "#f0f0f0",
                    padding: "10px 14px",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: 13,
                    borderBottom: "1px solid #ddd",
                    color: "#555",
                  }}
                >
                  사이즈
                </th>
                {data.measurementLabels.map((label, i) => (
                  <th
                    key={i}
                    style={{
                      backgroundColor: "#f0f0f0",
                      padding: "10px 14px",
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: 13,
                      borderBottom: "1px solid #ddd",
                      color: "#555",
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.sizeRows.map((row, ri) => (
                <tr key={ri}>
                  <td
                    style={{
                      padding: "10px 14px",
                      textAlign: "center",
                      fontWeight: 600,
                      borderBottom: "1px solid #eee",
                      color: "#333",
                    }}
                  >
                    {row.sizeName || "-"}
                  </td>
                  {data.measurementLabels.map((_, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: "10px 14px",
                        textAlign: "center",
                        borderBottom: "1px solid #eee",
                        color: "#555",
                      }}
                    >
                      {row.measurements[ci] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 면책 문구 */}
        <div
          style={{
            fontSize: 12,
            color: "#999",
            lineHeight: 1.6,
          }}
        >
          - {SIZE_DISCLAIMER}
        </div>
      </div>
    );
  },
);

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        marginBottom: 8,
        fontSize: 14,
        lineHeight: 1.7,
      }}
    >
      <div
        style={{
          width: 80,
          fontWeight: 600,
          color: "#555",
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div style={{ color: "#666" }}>{value}</div>
    </div>
  );
}
