import { type Metadata } from "next";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "자주 묻는 질문",
  description: "똑픽 서비스 이용에 관한 자주 묻는 질문과 답변입니다.",
};

const FAQ_ITEMS = [
  {
    category: "서비스 이용",
    items: [
      {
        q: "똑픽은 어떤 서비스인가요?",
        a: "똑픽은 동대문 의류 셀러를 위한 AI 이미지 편집 서비스입니다. 의류 교체, 색상 변경, 포즈 변경, 배경 교체 등의 기능을 AI로 빠르고 저렴하게 제공합니다.",
      },
      {
        q: "무료로 체험할 수 있나요?",
        a: "네, 회원가입 시 무료 30 크레딧이 제공됩니다. 1K 해상도 이미지 기준 30장까지 무료로 생성해볼 수 있습니다.",
      },
      {
        q: "어떤 해상도의 이미지를 생성할 수 있나요?",
        a: "1K, 2K, 4K 해상도를 지원합니다. 해상도가 높을수록 더 많은 크레딧이 소모됩니다 (1K: 1 크레딧, 2K: 2 크레딧, 4K: 5 크레딧).",
      },
      {
        q: "비디오 생성도 가능한가요?",
        a: "네, AI 비디오 생성 기능도 제공합니다. 5초(10 크레딧), 10초(20 크레딧) 영상을 생성할 수 있습니다.",
      },
    ],
  },
  {
    category: "결제 및 토큰",
    items: [
      {
        q: "결제 방법은 무엇이 있나요?",
        a: "토스페이먼츠를 통해 신용카드, 체크카드 등으로 결제할 수 있습니다. 단건 충전과 월간 구독 두 가지 방식을 제공합니다.",
      },
      {
        q: "토큰(크레딧)의 유효기간이 있나요?",
        a: "충전된 토큰은 유효기간이 없으며, 회원 탈퇴 시까지 유효합니다. 단, 회원 탈퇴 시 미사용 토큰은 소멸됩니다.",
      },
      {
        q: "환불은 어떻게 하나요?",
        a: "미사용 토큰에 대해 결제일로부터 7일 이내 전액 환불이 가능합니다. 이미 사용된 토큰은 환불이 불가합니다. 구독 해지 시 남은 기간에 대한 환불은 제공되지 않으며, 해당 기간 종료 시까지 서비스를 이용할 수 있습니다.",
      },
      {
        q: "구독을 해지하면 어떻게 되나요?",
        a: "구독 해지 시 현재 결제 기간 종료일까지 서비스를 정상 이용할 수 있습니다. 기간 종료 후 자동 갱신이 중단됩니다.",
      },
    ],
  },
  {
    category: "계정",
    items: [
      {
        q: "어떤 소셜 계정으로 가입할 수 있나요?",
        a: "카카오와 Google 계정으로 간편하게 가입할 수 있습니다.",
      },
      {
        q: "회원 탈퇴는 어떻게 하나요?",
        a: "대시보드 → 설정 → 회원 탈퇴에서 탈퇴할 수 있습니다. 탈퇴 시 모든 데이터(프로필, 토큰, 구독, 이미지)가 영구 삭제되며 복구할 수 없습니다.",
      },
      {
        q: "생성한 이미지의 저작권은 누구에게 있나요?",
        a: "서비스를 통해 생성한 이미지의 저작권은 이용자에게 귀속됩니다. 단, 타인의 초상권·상표권·저작권을 침해하지 않는 이미지만 업로드해야 하며, 이를 위반하여 발생하는 책임은 이용자에게 있습니다.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">자주 묻는 질문</h1>
        <p className="mt-2 text-muted-foreground">
          궁금한 점을 빠르게 확인하세요
        </p>
      </div>

      <div className="mt-12 space-y-10">
        {FAQ_ITEMS.map((section) => (
          <section key={section.category}>
            <h2 className="text-lg font-semibold">{section.category}</h2>
            <Accordion type="multiple" className="mt-4">
              {section.items.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`${section.category}-${i}`}
                >
                  <AccordionTrigger className="text-left text-sm">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      {/* 문의 안내 */}
      <div className="mt-16 rounded-lg border bg-muted/30 p-6 text-center">
        <h2 className="text-lg font-semibold">답변을 찾지 못하셨나요?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          아래 이메일로 문의해주시면 영업일 기준 1~2일 내에 답변드립니다.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="mailto:support@ddokpick.com">이메일 문의하기</Link>
        </Button>
      </div>
    </div>
  );
}
