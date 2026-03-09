import {
  Shirt,
  Palette,
  PersonStanding,
  Wallpaper,
  Users,
  ScanSearch,
  Sparkles,
  LayoutTemplate,
  Camera,
  Video,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  accent: string;
  iconBg: string;
}

const features: Feature[] = [
  {
    icon: Shirt,
    title: "의류 교체",
    description: "모델 사진에 원하는 옷을 자동 합성. 별도 촬영 없이 상세페이지용 피팅컷을 즉시 생성합니다.",
    accent: "from-violet-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:to-indigo-500/20",
    iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
  },
  {
    icon: Palette,
    title: "색상 변경",
    description: "한 벌 촬영본으로 12가지 컬러 바리에이션을 생성. 컬러피커로 원하는 색상을 정확하게 적용합니다.",
    accent: "from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20",
    iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  },
  {
    icon: PersonStanding,
    title: "포즈 변경",
    description: "정면 사진 한 장으로 측면·뒷면·앉은 포즈 등 다양한 앵글을 재촬영 없이 생성합니다.",
    accent: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  {
    icon: Wallpaper,
    title: "배경 변경",
    description: "단색·스튜디오·야외 등 원하는 배경으로 즉시 교체. 계절·콘셉트에 맞는 배경을 자유롭게 연출합니다.",
    accent: "from-sky-500/10 to-blue-500/10 dark:from-sky-500/20 dark:to-blue-500/20",
    iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400",
  },
  {
    icon: Users,
    title: "멀티포즈 변경",
    description: "여러 포즈를 한 번에 일괄 생성. 다량의 상품 이미지를 빠르게 처리합니다.",
    accent: "from-amber-500/10 to-yellow-500/10 dark:from-amber-500/20 dark:to-yellow-500/20",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  },
  {
    icon: ScanSearch,
    title: "상세 추출",
    description: "소재·봉제·디테일 부분을 고해상도로 확대 추출. 상세페이지 디테일 컷을 자동으로 생성합니다.",
    accent: "from-cyan-500/10 to-teal-500/10 dark:from-cyan-500/20 dark:to-teal-500/20",
    iconBg: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
  },
  {
    icon: Sparkles,
    title: "자동 피팅 생성기",
    description: "AI가 상품 이미지를 분석해 최적의 모델·포즈·배경을 자동 매칭. 클릭 한 번으로 피팅컷 완성.",
    accent: "from-fuchsia-500/10 to-purple-500/10 dark:from-fuchsia-500/20 dark:to-purple-500/20",
    iconBg: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400",
  },
  {
    icon: LayoutTemplate,
    title: "상세페이지 빌더",
    description: "상품 이미지 한 장으로 AI가 상품명·특징·컬러칩·사이즈표 섹션을 자동 생성. 바로 업로드 가능한 PNG로 다운로드.",
    badge: "NEW",
    accent: "from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20",
    iconBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
  },
  {
    icon: Camera,
    title: "UGC 이미지",
    description: "타겟 고객층에 맞는 UGC 스타일 이미지를 AI로 생성. 광고·SNS에 바로 활용할 수 있는 자연스러운 연출컷.",
    accent: "from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20",
    iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
  },
  {
    icon: Video,
    title: "AI 비디오",
    description: "상품 사진으로 원단·핏·디테일을 보여주는 5~10초 영상을 자동 생성. 쇼핑몰·SNS 광고용 영상 제작 비용을 절감합니다.",
    badge: "BETA",
    accent: "from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20",
    iconBg: "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
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
          하나의 사진으로
          <br className="hidden sm:block" />
          모든 이미지를
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          의류 셀러에게 필요한 모든 이미지 작업을 AI 하나로.
          <br className="hidden sm:block" />
          촬영 비용과 시간을 동시에 아끼세요.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg select-none"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />

            <div className="relative z-10">
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.iconBg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                {feature.badge && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary">
                    {feature.badge}
                  </span>
                )}
              </div>

              <h3 className="mb-2 text-base font-semibold tracking-tight">
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
