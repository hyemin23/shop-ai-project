import {
  Shirt,
  Palette,
  PersonStanding,
  Wallpaper,
  Users,
  Layers,
  History,
  Coins,
  Settings,
} from "lucide-react";
import { type DashboardConfig } from "@/types";

export const dashboardConfig: DashboardConfig = {
  sidebarNavGroups: [
    {
      // AI 이미지 편집 기능 모음
      title: "AI 스튜디오",
      items: [
        { title: "의류 교체", href: "/dashboard/studio", icon: Shirt },
        {
          title: "색상 변경",
          href: "/dashboard/studio/color-swap",
          icon: Palette,
        },
        {
          title: "포즈 변경",
          href: "/dashboard/studio/pose-transfer",
          icon: PersonStanding,
        },
        {
          title: "배경 변경",
          href: "/dashboard/studio/background-swap",
          icon: Wallpaper,
        },
        {
          title: "멀티포즈 변경",
          href: "/dashboard/studio/multi-pose",
          icon: Users,
        },
        {
          title: "배치 처리",
          href: "/dashboard/studio/batch",
          icon: Layers,
        },
      ],
    },
    {
      // 계정 및 서비스 관리 항목
      title: "관리",
      items: [
        { title: "작업 히스토리", href: "/dashboard/history", icon: History },
        { title: "토큰 충전", href: "/dashboard/tokens", icon: Coins },
        { title: "설정", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ],
};
