const STATS = [
  { value: "30초", label: "평균 이미지 생성 시간" },
  { value: "10+", label: "AI 편집 기능" },
  { value: "1,000원↓", label: "이미지 1장당 비용" },
  { value: "90%↓", label: "촬영 비용 절감" },
];

export function StatsSection() {
  return (
    <section className="border-t">
      <div className="container mx-auto px-4 py-16 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center select-none">
              <p className="text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
