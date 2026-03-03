import { Logo } from "@/components/logo";
import { Sparkles, Palette, PersonStanding } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-5">
      {/* Left decorative panel — desktop only */}
      <div
        className="relative hidden overflow-hidden lg:col-span-3 lg:flex"
        aria-hidden="true"
      >
        {/* Background layers */}
        <div className="gradient-mesh absolute inset-0" />
        <div className="grain absolute inset-0" />

        {/* Floating gradient blobs */}
        <div className="animate-glow-pulse absolute -right-20 -top-20 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="animate-float absolute -bottom-16 -left-16 h-80 w-80 rounded-full bg-chart-3/12 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-56 w-56 rounded-full bg-chart-5/10 blur-3xl" />
        <div className="absolute left-1/3 top-1/4 h-40 w-40 rounded-full bg-chart-4/8 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
          {/* Top: Logo */}
          <div className="animate-fade-in">
            <Logo />
          </div>

          {/* Center: Tagline */}
          <div className="animate-fade-in-up space-y-6">
            <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              사진 한 장으로
              <br />
              <span className="text-gradient">무한한 가능성을</span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              의류 교체, 색상 변경, 포즈 변경을 AI가 수 분 이내로 처리합니다.
              동대문 셀러의 상품 촬영 비용을 획기적으로 줄여보세요.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2">
              <div className="glass flex items-center gap-1.5 rounded-full border border-border/50 px-3.5 py-1.5 text-xs font-medium">
                <Sparkles className="h-3 w-3 text-primary" />
                의류 교체
              </div>
              <div className="glass flex items-center gap-1.5 rounded-full border border-border/50 px-3.5 py-1.5 text-xs font-medium">
                <Palette className="h-3 w-3 text-primary" />
                색상 변경
              </div>
              <div className="glass flex items-center gap-1.5 rounded-full border border-border/50 px-3.5 py-1.5 text-xs font-medium">
                <PersonStanding className="h-3 w-3 text-primary" />
                포즈 변경
              </div>
            </div>
          </div>

          {/* Bottom: Attribution */}
          <p className="animate-fade-in text-sm text-muted-foreground/60">
            동대문 셀러를 위한 AI 스튜디오
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 lg:col-span-2 lg:px-12">
        <div className="mb-10 lg:hidden">
          <Logo />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
