import {
  Shirt,
  Palette,
  PersonStanding,
  Download,
  Zap,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  iconBg: string;
}

const features: Feature[] = [
  {
    icon: Shirt,
    title: "의류 교체",
    description:
      "모델 사진에 원하는 옷을 자동으로 입혀보세요. 별도 촬영 없이 상세페이지용 이미지를 즉시 생성합니다.",
    accent: "from-violet-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:to-indigo-500/20",
    iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
  },
  {
    icon: Palette,
    title: "색상 변경",
    description:
      "한 벌 촬영본으로 12가지 색상 바리에이션을 만들어보세요. 컬러피커로 원하는 색상을 정확하게 적용합니다.",
    accent: "from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20",
    iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  },
  {
    icon: PersonStanding,
    title: "포즈 변경",
    description:
      "정면 사진 한 장으로 10가지 포즈 변형을 생성합니다. 측면, 뒷면, 앉은 포즈 등 다양한 앵글을 재촬영 없이.",
    accent: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  {
    icon: Zap,
    title: "수 분 이내 생성",
    description:
      "평균 30초 이내에 고품질 이미지를 생성합니다. 기존 3~7일 촬영 일정을 당일로 단축합니다.",
    accent: "from-amber-500/10 to-yellow-500/10 dark:from-amber-500/20 dark:to-yellow-500/20",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  },
  {
    icon: Download,
    title: "즉시 다운로드",
    description:
      "생성된 이미지를 PNG/JPG로 즉시 다운로드하세요. Before/After 비교 뷰로 결과물을 확인합니다.",
    accent: "from-sky-500/10 to-blue-500/10 dark:from-sky-500/20 dark:to-blue-500/20",
    iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400",
  },
  {
    icon: ShieldCheck,
    title: "건당 1,000원 이하",
    description:
      "1벌당 5~15만 원의 촬영 비용을 대폭 절감합니다. 다품종 소량 셀러에게 최적화된 합리적인 가격.",
    accent: "from-fuchsia-500/10 to-purple-500/10 dark:from-fuchsia-500/20 dark:to-purple-500/20",
    iconBg: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative container mx-auto px-4 py-24 md:px-8 md:py-32">
      <div className="mb-16 text-center select-none">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
          Features
        </p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          촬영 비용 걱정 없이
          <br className="hidden sm:block" />
          시작하세요
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          동대문 셀러를 위한 3가지 핵심 기능으로
          상품 이미지 제작을 혁신합니다.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg select-none"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Gradient accent on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />

            <div className="relative z-10">
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.iconBg} transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className="h-5 w-5" />
              </div>

              <h3 className="mb-2 text-lg font-semibold tracking-tight">
                {feature.title}
              </h3>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
