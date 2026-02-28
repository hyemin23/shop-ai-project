import { type Metadata } from "next";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "똑픽 (DDokPick) — AI 의류 이미지 편집 서비스",
  description:
    "동대문 의류 셀러를 위한 AI 이미지 편집 B2B SaaS. 의류 교체, 색상 변경, 포즈 변경을 건당 수백 원, 수 분 이내로.",
  keywords: [
    "AI 이미지 편집",
    "의류 사진",
    "동대문",
    "셀러",
    "가상 피팅",
    "색상 변경",
    "포즈 변경",
  ],
  openGraph: {
    title: "똑픽 (DDokPick) — AI 의류 이미지 편집",
    description:
      "의류 교체·색상 변경·포즈 변경을 AI로. 동대문 셀러를 위한 초간편 이미지 편집 서비스.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "똑픽 (DDokPick) — AI 의류 이미지 편집",
    description:
      "의류 교체·색상 변경·포즈 변경을 AI로. 동대문 셀러를 위한 초간편 이미지 편집 서비스.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "똑픽 (DDokPick)",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: siteConfig.description,
  url: siteConfig.url,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
    description: "무료 체험 제공",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <FeaturesSection />
    </>
  );
}
