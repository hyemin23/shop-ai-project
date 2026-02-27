import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="container mx-auto flex flex-col items-center gap-8 px-4 py-24 text-center md:py-32">
      <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm">
        AI 의류 이미지 편집 서비스
      </Badge>

      <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        촬영 없이 만드는
        <br />
        <span className="text-muted-foreground">상품 이미지</span>
      </h1>

      <p className="max-w-xl text-lg text-muted-foreground">
        동대문 의류 셀러를 위한 AI 이미지 편집 서비스. 의류 교체, 색상 변경,
        포즈 변경을 건당 1,000원 이하, 수 분 이내로.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/dashboard">
            스튜디오 시작하기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="#features">기능 살펴보기</Link>
        </Button>
      </div>
    </section>
  );
}
