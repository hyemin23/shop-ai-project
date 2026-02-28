import {
  Shirt,
  Palette,
  PersonStanding,
  Layers,
  History,
  Coins,
  Settings,
} from "lucide-react";
import { type DashboardConfig } from "@/types";

export const dashboardConfig: DashboardConfig = {
  sidebarNav: [
    { title: "의류 교체", href: "/dashboard/studio", icon: Shirt },
    { title: "색상 변경", href: "/dashboard/studio/color-swap", icon: Palette },
    {
      title: "포즈 변경",
      href: "/dashboard/studio/pose-transfer",
      icon: PersonStanding,
    },
    {
      title: "배치 처리",
      href: "/dashboard/studio/batch",
      icon: Layers,
    },
    { title: "작업 히스토리", href: "/dashboard/history", icon: History },
    { title: "토큰 충전", href: "/dashboard/tokens", icon: Coins },
    { title: "설정", href: "/dashboard/settings", icon: Settings },
  ],
};
