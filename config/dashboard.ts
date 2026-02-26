import { Shirt, Palette, PersonStanding, History, Settings } from "lucide-react"
import { type DashboardConfig } from "@/types"

export const dashboardConfig: DashboardConfig = {
  sidebarNav: [
    { title: "의류 교체", href: "/dashboard/studio", icon: Shirt },
    { title: "색상 변경", href: "/dashboard/studio/color-swap", icon: Palette },
    { title: "포즈 변경", href: "/dashboard/studio/pose-transfer", icon: PersonStanding },
    { title: "작업 히스토리", href: "/dashboard/history", icon: History },
    { title: "설정", href: "/dashboard/settings", icon: Settings },
  ],
}
