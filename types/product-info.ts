export interface ProductInfoFormData {
  // 기본 정보
  colors: string;
  sizes: string;
  // 모델 스펙
  modelHeight: string;
  modelWeight: string;
  modelTopSize: string;
  modelBottomSize: string;
  // 착용 정보
  fittingColors: string;
  fittingSize: string;
  // 소재
  fabric: string;
  // 실측 정보
  measurementLabels: string[];
  sizeRows: SizeRow[];
}

export interface SizeRow {
  sizeName: string;
  measurements: string[];
}

export interface ModelSpec {
  modelHeight: string;
  modelWeight: string;
  modelTopSize: string;
  modelBottomSize: string;
}
