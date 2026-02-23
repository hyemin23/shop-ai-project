import { type SiteConfig } from "@/types"

export const siteConfig: SiteConfig = {
  name: "Starter Kit",
  description: "Next.js 풀스택 스타터킷. 인증, 대시보드, 마케팅 페이지를 포함합니다.",
  url: "https://example.com",
  links: {
    github: "https://github.com",
  },
  mainNav: [
    { title: "기능", href: "/#features" },
    { title: "컴포넌트", href: "/components" },
    { title: "대시보드", href: "/dashboard" },
  ],
  footerNav: [
    {
      title: "제품",
      items: [
        { title: "기능", href: "/#features" },
        { title: "가격", href: "#" },
        { title: "문서", href: "#" },
      ],
    },
    {
      title: "회사",
      items: [
        { title: "소개", href: "#" },
        { title: "블로그", href: "#" },
        { title: "채용", href: "#" },
      ],
    },
    {
      title: "법적 고지",
      items: [
        { title: "개인정보처리방침", href: "#" },
        { title: "이용약관", href: "#" },
      ],
    },
  ],
}
