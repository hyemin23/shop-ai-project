export type DetailExtractMode = "rose-cut" | "4-split" | "nukki";

export interface DetailPreset {
  id: string;
  name: string;
  nameKo: string;
  description: string; // 영문 (프롬프트용)
}

export const DETAIL_PRESETS: DetailPreset[] = [
  { id: "neckline", name: "Neckline", nameKo: "넥라인/칼라", description: "neckline, collar, and neck area construction" },
  { id: "cuff", name: "Cuff/Sleeve", nameKo: "소매/커프스", description: "cuff, sleeve ending, and wrist area detail" },
  { id: "button", name: "Button/Fastener", nameKo: "단추/잠금장치", description: "buttons, snaps, hooks, or fastening hardware" },
  { id: "zipper", name: "Zipper", nameKo: "지퍼", description: "zipper teeth, pull tab, and tape detail" },
  { id: "fabric", name: "Fabric Texture", nameKo: "원단감", description: "fabric weave, texture, and material surface" },
  { id: "stitching", name: "Stitching", nameKo: "스티칭/솔기", description: "seam stitching, topstitching, and thread detail" },
  { id: "ribbing", name: "Ribbing/Trim", nameKo: "시보리/트리밍", description: "ribbed trim, elastic band, and border finishing" },
  { id: "hem", name: "Hemline", nameKo: "밑단", description: "bottom hem, finishing edge, and fold detail" },
  { id: "pocket", name: "Pocket", nameKo: "포켓", description: "pocket shape, flap, and placement detail" },
  { id: "label", name: "Label/Tag", nameKo: "라벨/태그", description: "brand label, care tag, and printed information" },
];

export const DEFAULT_4SPLIT_PRESETS = ["neckline", "cuff", "fabric", "stitching"];
