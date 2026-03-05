import { type SizeRow } from "@/types/product-info";

export const DEFAULT_MEASUREMENT_LABELS = ["어깨", "가슴", "총장", "소매"];

export const DEFAULT_SIZE_ROW: SizeRow = {
  sizeName: "",
  measurements: ["", "", "", ""],
};

export const MODEL_SPEC_STORAGE_KEY = "ddokpick_model_spec";

export const DETAIL_DISCLAIMER =
  "제품색상은 사용자의 모니터의 해상도에 따라 실제 색상과 다소 차이가 있을 수 있습니다.";

export const SIZE_DISCLAIMER =
  "사이즈 측정 방법에 따라 최대 1~2CM 오차가 발생할 수 있습니다.";
