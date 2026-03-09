import { forwardRef } from "react";
import { OUTPUT_WIDTH } from "@/config/detail-page";
import { COLOR_PRESETS } from "@/config/studio";

interface SingleColorChipCardProps {
  colorName: string;
}

function resolveColorHex(colorName: string): string {
  const normalized = colorName.trim().toLowerCase();
  const presetByKo = COLOR_PRESETS.find(
    (p) => p.nameKo === colorName.trim(),
  );
  if (presetByKo) return presetByKo.hex;
  const presetByEn = COLOR_PRESETS.find((p) => p.name === normalized);
  if (presetByEn) return presetByEn.hex;
  return "#999999";
}

function getColorEnglishName(colorName: string): string {
  const normalized = colorName.trim().toLowerCase();
  const presetByKo = COLOR_PRESETS.find(
    (p) => p.nameKo === colorName.trim(),
  );
  if (presetByKo) return presetByKo.name.toUpperCase();
  const presetByEn = COLOR_PRESETS.find((p) => p.name === normalized);
  if (presetByEn) return presetByEn.name.toUpperCase();
  return colorName.trim().toUpperCase();
}

export const SingleColorChipCard = forwardRef<
  HTMLDivElement,
  SingleColorChipCardProps
>(function SingleColorChipCard({ colorName }, ref) {
  const hex = resolveColorHex(colorName);
  const enName = getColorEnglishName(colorName);
  const isLight =
    hex.toUpperCase() === "#FFFFFF" || hex.toUpperCase() === "#FFFFF0";

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: hex,
            border: isLight ? "1px solid #ddd" : "none",
          }}
        />
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#333",
            letterSpacing: "0.1em",
          }}
        >
          {enName}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#888",
          }}
        >
          {colorName.trim()}
        </div>
      </div>
    </div>
  );
});

export function parseColorList(colors: string): string[] {
  return colors
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}
