import {
  Shirt,
  Palette,
  PersonStanding,
  Wallpaper,
  Users,
  ScanSearch,
  Sparkles,

  FileImage,
  Camera,
  Video,
  History,
  Coins,
  CreditCard,
  Settings,
  ShieldCheck,
  ScrollText,
} from "lucide-react";
import { type DashboardConfig } from "@/types";

export const dashboardConfig: DashboardConfig = {
  sidebarNavGroups: [
    {
      // AI 이미지 편집 기능 모음
      title: "AI 스튜디오",
      items: [
        { title: "의류 교체", href: "/dashboard/studio", icon: Shirt, description: "모델 이미지에 새 의류를 자동 합성" },
        { title: "색상 변경", href: "/dashboard/studio/color-swap", icon: Palette, description: "원단 색상을 원하는 컬러로 변경" },
        { title: "포즈 변경", href: "/dashboard/studio/pose-transfer", icon: PersonStanding, description: "모델의 포즈를 다양하게 전환" },
        { title: "배경 변경", href: "/dashboard/studio/background-swap", icon: Wallpaper, description: "촬영 배경 장면을 새로 교체" },
        { title: "멀티포즈 변경", href: "/dashboard/studio/multi-pose", icon: Users, description: "여러 포즈를 한 번에 일괄 생성" },
        { title: "상세 추출", href: "/dashboard/studio/detail-extract", icon: ScanSearch, description: "상품 디테일을 확대하여 추출" },
        { title: "자동피팅생성기", href: "/dashboard/studio/auto-fitting", icon: Sparkles, description: "AI가 자동으로 피팅 이미지 생성" },
        { title: "UGC 이미지", href: "/dashboard/studio/ugc", icon: Camera, description: "타겟 맞춤 UGC 스타일 이미지 생성" },

        { title: "상세 정보 카드", href: "/dashboard/studio/product-info", icon: FileImage, description: "상품 상세 정보 카드를 자동 생성" },
      ],
    },
    {
      // AI 비디오 생성 (이미지 → 2~3초 상품 영상)
      title: "AI 비디오",
      hiddenForBeta: true,
      items: [
        { title: "상품 영상 생성", href: "/dashboard/video/image-to-video", icon: Video, description: "상품 사진으로 원단/핏/디테일 영상 생성" },
      ],
    },
    {
      // 계정 및 서비스 관리 항목
      title: "관리",
      items: [
        { title: "작업 히스토리", href: "/dashboard/history", icon: History },
        { title: "토큰 충전", href: "/dashboard/tokens", icon: Coins },
        { title: "구독 관리", href: "/dashboard/subscription", icon: CreditCard },
        { title: "설정", href: "/dashboard/settings", icon: Settings },
      ],
    },
    {
      title: "관리자",
      isMasterOnly: true,
      items: [
        { title: "대시보드", href: "/dashboard/admin", icon: ShieldCheck, description: "서비스 현황 모니터링" },
        { title: "생성 로그", href: "/dashboard/admin/logs", icon: ScrollText, description: "AI 생성 작업 로그 조회" },
        { title: "사용자 관리", href: "/dashboard/admin/users", icon: Users, description: "사용자 조회 및 토큰 충전" },
      ],
    },
  ],
};

/** "관리" 제외한 기능 그룹 반환 (마케팅/모바일 네비용) */
export function getFeatureGroups() {
  return dashboardConfig.sidebarNavGroups.filter((g) => g.title !== "관리");
}
