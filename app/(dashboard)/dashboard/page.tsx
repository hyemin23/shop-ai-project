import Link from "next/link"
import { Shirt, Palette, PersonStanding, ArrowRight } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const studioFeatures = [
  {
    icon: Shirt,
    title: "의류 교체",
    description: "모델 사진에 원하는 의류를 자동으로 교체합니다. Base 이미지와 Reference 이미지를 업로드하세요.",
    href: "/dashboard/studio",
    badge: "Virtual Try-On",
  },
  {
    icon: Palette,
    title: "색상 변경",
    description: "의류 색상을 원하는 색으로 변경합니다. 컬러피커 또는 12가지 프리셋 팔레트를 활용하세요.",
    href: "/dashboard/studio/color-swap",
    badge: "Color Swap",
  },
  {
    icon: PersonStanding,
    title: "포즈 변경",
    description: "모델의 포즈를 10가지 프리셋 중에서 선택하거나 참조 이미지로 변경합니다.",
    href: "/dashboard/studio/pose-transfer",
    badge: "Pose Transfer",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">스튜디오</h1>
        <p className="text-muted-foreground">AI로 의류 이미지를 편집하세요. 촬영 없이 수 분 이내에 완성합니다.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {studioFeatures.map((feature) => (
          <Card key={feature.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3">
                <feature.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{feature.badge}</p>
                </div>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <Button asChild className="w-full">
                <Link href={feature.href}>
                  시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
