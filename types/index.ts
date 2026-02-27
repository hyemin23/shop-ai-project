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
  sidebarNav: SidebarNavItem[];
}
