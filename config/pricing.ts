import { type TokenPackage } from "@/types/payment";

export const TOKEN_COST = {
  standard: {
    "try-on": { "1024": 10, "2048": 15 },
    "color-swap": { "1024": 8, "2048": 12 },
    "pose-transfer": { "1024": 10, "2048": 15 },
    "background-swap": { "1024": 10, "2048": 15 },
    "multi-pose": { "1024": 10, "2048": 15 },
    "detail-extract": { "1024": 10, "2048": 15 },
    // 자동피팅: 포즈 1개당 비용 (5개 포즈 × 1토큰 = 총 5토큰)
    "auto-fitting": { "1024": 1, "2048": 2 },
  },
  premium: {
    "try-on": { "1024": 20, "2048": 30, "4096": 40 },
    "color-swap": { "1024": 16, "2048": 24, "4096": 35 },
    "pose-transfer": { "1024": 20, "2048": 30, "4096": 40 },
    "background-swap": { "1024": 20, "2048": 30, "4096": 40 },
    "multi-pose": { "1024": 20, "2048": 30, "4096": 40 },
    "detail-extract": { "1024": 20, "2048": 30, "4096": 40 },
    // 자동피팅: 포즈 1개당 비용
    "auto-fitting": { "1024": 2, "2048": 3, "4096": 5 },
  },
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
