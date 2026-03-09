export interface DetailPageGenerateRequest {
  sourceImage: string; // base64
  fabric: string;
  colors: string;
  sizes: string;
  additionalContext?: string;
}

export interface DetailPageGenerateResponse {
  subtitle: string; // 영문 서브타이틀
  productName: string; // 영문 상품명
  catchphrase: string; // 한글 캐치프레이즈
  description: string; // 한글 상품 설명
  features: DetailPageFeature[];
}

export interface DetailPageFeature {
  title: string; // "울 스판"
  description: string; // "부드러운 울 스판 혼방 소재"
  svgIcon: string; // SVG 코드 문자열
}
