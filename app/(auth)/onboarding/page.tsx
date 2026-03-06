"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingForm />
    </Suspense>
  );
}

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRequiredAgreed = agreeTerms && agreePrivacy;
  const allAgreed = agreeTerms && agreePrivacy && agreeMarketing;

  async function handleSubmit() {
    if (!isRequiredAgreed) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agreeTerms,
          agreePrivacy,
          agreeMarketing,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.replace(next);
      } else {
        toast.error(data.error || "동의 처리에 실패했습니다.");
      }
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight">
          서비스 이용 동의
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          서비스 이용을 위해 아래 약관에 동의해 주세요.
        </p>
      </div>

      <div className="animate-fade-in-up space-y-4 [animation-delay:0.1s]">
        <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
          {/* 전체 동의 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={allAgreed}
              onCheckedChange={(checked) => {
                const value = !!checked;
                setAgreeTerms(value);
                setAgreePrivacy(value);
                setAgreeMarketing(value);
              }}
            />
            <span className="text-sm font-semibold">전체 동의</span>
          </label>

          <div className="border-t border-border pt-4 space-y-3">
            {/* 이용약관 */}
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(!!checked)}
              />
              <span className="text-sm text-muted-foreground">
                <span className="text-destructive font-medium">[필수]</span>{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="underline-offset-4 hover:underline hover:text-foreground"
                >
                  이용약관
                </Link>
                에 동의합니다
              </span>
            </label>

            {/* 개인정보처리방침 */}
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={agreePrivacy}
                onCheckedChange={(checked) => setAgreePrivacy(!!checked)}
              />
              <span className="text-sm text-muted-foreground">
                <span className="text-destructive font-medium">[필수]</span>{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="underline-offset-4 hover:underline hover:text-foreground"
                >
                  개인정보처리방침
                </Link>
                에 동의합니다
              </span>
            </label>

            {/* 마케팅 수신 */}
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={agreeMarketing}
                onCheckedChange={(checked) => setAgreeMarketing(!!checked)}
              />
              <span className="text-sm text-muted-foreground">
                [선택] 마케팅 정보 수신에 동의합니다
              </span>
            </label>
          </div>
        </div>

        <Button
          className="w-full rounded-xl py-6 text-sm font-semibold"
          onClick={handleSubmit}
          disabled={!isRequiredAgreed || isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          동의하고 시작하기
        </Button>

        <p className="text-center text-xs text-muted-foreground/60">
          필수 항목에 동의하지 않으면 서비스를 이용할 수 없습니다.
        </p>
      </div>
    </div>
  );
}
