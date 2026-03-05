import { type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
}

export interface SidebarNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  description?: string;
}

// 카테고리 그룹 단위 — 대분류 제목과 하위 항목 목록으로 구성
export interface SidebarNavGroup {
  title: string;
  items: SidebarNavItem[];
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  links: {
    github?: string;
  };
  mainNav: NavItem[];
  footerNav: {
    title: string;
    items: NavItem[];
  }[];
}

export interface DashboardConfig {
  // 카테고리별로 그룹화된 사이드바 네비게이션
  sidebarNavGroups: SidebarNavGroup[];
}
