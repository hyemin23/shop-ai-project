import { type TokenPackage } from "@/types/payment";
import { type ImageSize } from "@/types/studio";

// 해상도 기반 단일 크레딧 체계 (이미지 1건당)
export const CREDIT_COST: Record<ImageSize, number> = {
  "1K": 1,
  "2K": 2,
  "4K": 5,
};

// 비디오 크레딧 (비디오 기능 구현 시 사용)
export const VIDEO_CREDIT_COST = {
  "5sec": { "1K": 2, "2K": 4, "4K": 10 },
  "10sec": { "1K": 4, "2K": 8, "4K": 20 },
} as const;

export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: "lite",
    name: "Lite",
    tokens: 150,
    price: 11000,
  },
  {
    id: "pro",
    name: "Pro",
    tokens: 500,
    price: 35000,
    bonusTokens: 50,
    recommended: true,
  },
  {
    id: "max",
    name: "Max",
    tokens: 1500,
    price: 99000,
    bonusTokens: 150,
  },
];

export const FREE_TRIAL_TOKENS = 30;
