import { type TokenPackage, type SubscriptionPlan } from "@/types/payment";
import { type ImageSize } from "@/types/studio";

// 해상도 기반 단일 크레딧 체계 (이미지 1건당)
export const CREDIT_COST: Record<ImageSize, number> = {
  "1K": 1,
  "2K": 2,
  "4K": 5,
};

// 비디오 크레딧 (duration 기반 단일 구조)
export const VIDEO_CREDIT_COST: Record<string, number> = {
  "5": 10, // 5초 = 10 토큰
  "10": 20, // 10초 = 20 토큰
};

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

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "sub_lite",
    name: "Lite",
    monthlyPrice: 9900,
    monthlyTokens: 150,
    description: "가볍게 시작하는 월간 구독",
    features: [
      "매월 150 크레딧 제공",
      "4K 고해상도 피팅컷 생성",
      "4K 고해상도 디테일 컷 생성",
      "4K 고화질 비디오 생성",
      "의류 특화 프롬프트 적용",
      "표준 처리속도",
    ],
  },
  {
    id: "sub_pro",
    name: "Pro",
    monthlyPrice: 29900,
    monthlyTokens: 550,
    description: "전문가를 위한 월간 구독",
    recommended: true,
    features: [
      "매월 500 + 보너스 50 크레딧",
      "4K 고해상도 피팅컷 생성",
      "4K 고해상도 디테일 컷 생성",
      "4K 고화질 비디오 생성",
      "의류 특화 프롬프트 적용",
      "우선 처리속도",
    ],
  },
  {
    id: "sub_max",
    name: "Max",
    monthlyPrice: 79900,
    monthlyTokens: 1650,
    description: "최대 성능의 월간 구독",
    features: [
      "매월 1500 + 보너스 150 크레딧",
      "4K 고해상도 피팅컷 생성",
      "4K 고해상도 디테일 컷 생성",
      "4K 고화질 비디오 생성",
      "의류 특화 프롬프트 적용",
      "최우선 처리속도",
    ],
  },
];
