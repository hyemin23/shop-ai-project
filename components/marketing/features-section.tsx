import {
  Shirt,
  Palette,
  PersonStanding,
  Download,
  Zap,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Shirt,
    title: "의류 교체 (Virtual Try-On)",
    description:
      "모델 사진에 원하는 옷을 자동으로 입혀보세요. 별도 촬영 없이 상세페이지용 이미지를 즉시 생성합니다.",
  },
  {
    icon: Palette,
    title: "색상 변경 (Color Swap)",
    description:
      "한 벌 촬영본으로 12가지 색상 바리에이션을 만들어보세요. 컬러피커로 원하는 색상을 정확하게 적용합니다.",
  },
  {
    icon: PersonStanding,
    title: "포즈 변경 (Pose Transfer)",
    description:
      "정면 사진 한 장으로 10가지 포즈 변형을 생성합니다. 측면, 뒷면, 앉은 포즈 등 다양한 앵글을 재촬영 없이.",
  },
  {
    icon: Zap,
    title: "수 분 이내 생성",
    description:
      "평균 30초 이내에 고품질 이미지를 생성합니다. 기존 3~7일 촬영 일정을 당일로 단축합니다.",
  },
  {
    icon: Download,
    title: "즉시 다운로드",
    description:
      "생성된 이미지를 PNG/JPG로 즉시 다운로드하세요. Before/After 비교 뷰로 결과물을 확인합니다.",
  },
  {
    icon: ShieldCheck,
    title: "건당 1,000원 이하",
    description:
      "1벌당 5~15만 원의 촬영 비용을 대폭 절감합니다. 다품종 소량 셀러에게 최적화된 합리적인 가격.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto px-4 py-24 md:px-8">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          촬영 비용 걱정 없이 시작하세요
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          동대문 셀러를 위한 3가지 핵심 기능으로 상품 이미지 제작을 혁신합니다.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
