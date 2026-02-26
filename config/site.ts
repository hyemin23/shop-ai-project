import { type SiteConfig } from "@/types"

export const siteConfig: SiteConfig = {
  name: "똑픽",
  description: "동대문 의류 셀러를 위한 AI 이미지 편집 B2B SaaS. 의류 교체, 색상 변경, 포즈 변경을 건당 수백 원, 수 분 이내로.",
  url: "https://ddokpick.com",
  links: {
    github: "https://github.com",
  },
  mainNav: [
    { title: "기능", href: "/#features" },
    { title: "가격", href: "/#pricing" },
    { title: "스튜디오", href: "/dashboard" },
  ],
  footerNav: [
    {
      title: "서비스",
      items: [
        { title: "기능 소개", href: "/#features" },
        { title: "가격 안내", href: "/#pricing" },
        { title: "스튜디오", href: "/dashboard" },
      ],
    },
    {
      title: "고객 지원",
      items: [
        { title: "자주 묻는 질문", href: "#" },
        { title: "문의하기", href: "#" },
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
