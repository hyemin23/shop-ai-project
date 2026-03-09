export const OUTPUT_WIDTH = 860;

export const SECTION_NAMES = {
  productName: "01_상품명헤더",
  catchphrase: "02_상품설명",
  features: "03_상품특징",
  fabric: "04_FABRIC",
  productInfo: "05_제품정보카드",
  detailHeader: "06_DETAIL헤더",
  sizeInfo: "07_SIZE_INFO",
} as const;

/** 컬러칩은 동적 개수이므로 함수로 이름 생성 */
export function colorChipSectionName(index: number, colorName: string): string {
  return `08_컬러칩_${String(index + 1).padStart(2, "0")}_${colorName.trim()}`;
}

export const DETAIL_PAGE_STORAGE_KEY = "ddokpick_detail_page_form";
