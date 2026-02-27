// Studio Error System - PRD 에러 코드 정의

export type StudioErrorCode =
  | "STUDIO_001"
  | "STUDIO_002"
  | "STUDIO_003"
  | "STUDIO_004"
  | "STUDIO_005"
  | "STUDIO_006"
  | "STUDIO_007";

interface StudioErrorDef {
  code: StudioErrorCode;
  message: string;
  retryable: boolean;
}

export const STUDIO_ERROR_CODES: Record<StudioErrorCode, StudioErrorDef> = {
  STUDIO_001: {
    code: "STUDIO_001",
    message: "지원하지 않는 이미지 포맷입니다.",
    retryable: false,
  },
  STUDIO_002: {
    code: "STUDIO_002",
    message: "이미지 크기가 제한을 초과했습니다.",
    retryable: false,
  },
  STUDIO_003: {
    code: "STUDIO_003",
    message: "의류 영역을 감지할 수 없습니다.",
    retryable: false,
  },
  STUDIO_004: {
    code: "STUDIO_004",
    message: "API 요청 시간이 초과되었습니다.",
    retryable: true,
  },
  STUDIO_005: {
    code: "STUDIO_005",
    message: "요청 횟수 제한을 초과했습니다. 잠시 후 다시 시도해주세요.",
    retryable: true,
  },
  STUDIO_006: {
    code: "STUDIO_006",
    message: "AI 서비스에 일시적인 오류가 발생했습니다.",
    retryable: true,
  },
  STUDIO_007: {
    code: "STUDIO_007",
    message: "이미지에서 인물을 감지할 수 없습니다.",
    retryable: false,
  },
};

export class StudioError extends Error {
  readonly code: StudioErrorCode;
  readonly retryable: boolean;

  constructor(code: StudioErrorCode) {
    const def = STUDIO_ERROR_CODES[code];
    super(def.message);
    this.name = "StudioError";
    this.code = def.code;
    this.retryable = def.retryable;
  }
}
