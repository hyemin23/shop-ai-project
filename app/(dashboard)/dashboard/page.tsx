import Link from "next/link";
import { Shirt, Palette, PersonStanding, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const studioFeatures = [
  {
    icon: Shirt,
    title: "의류 교체",
    description:
      "모델 사진에 원하는 의류를 자동으로 교체합니다. Base 이미지와 Reference 이미지를 업로드하세요.",
    href: "/dashboard/studio",
    badge: "Virtual Try-On",
    gradient: "from-violet-500 to-indigo-600",
    iconBg: "bg-violet-100 dark:bg-violet-500/20",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: Palette,
    title: "색상 변경",
    description:
      "의류 색상을 원하는 색으로 변경합니다. 컬러피커 또는 12가지 프리셋 팔레트를 활용하세요.",
    href: "/dashboard/studio/color-swap",
    badge: "Color Swap",
    gradient: "from-rose-500 to-orange-500",
    iconBg: "bg-rose-100 dark:bg-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: PersonStanding,
    title: "포즈 변경",
    description:
      "모델의 포즈를 10가지 프리셋 중에서 선택하거나 참조 이미지로 변경합니다.",
    href: "/dashboard/studio/pose-transfer",
    badge: "Pose Transfer",
    gradient: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">스튜디오</h1>
        <p className="mt-1 text-muted-foreground">
          AI로 의류 이미지를 편집하세요. 촬영 없이 수 분 이내에 완성합니다.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {studioFeatures.map((feature) => (
          <div
            key={feature.title}
            className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Gradient top bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${feature.gradient}`} />

            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${feature.iconBg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold tracking-tight">{feature.title}</h3>
                  <p className="text-xs font-medium text-muted-foreground">
                    {feature.badge}
                  </p>
                </div>
              </div>

              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>

              <div className="mt-6">
                <Button asChild className="w-full group/btn">
                  <Link href={feature.href}>
                    시작하기
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
