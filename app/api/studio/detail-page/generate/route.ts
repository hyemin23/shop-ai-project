import { NextResponse, type NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { processImageFile } from "@/lib/image-utils";
import { getUserOrSessionId } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import {
  checkFreeTrialLimit,
  TokenInsufficientError,
} from "@/lib/tokens";
import type { DetailPageGenerateResponse } from "@/types/detail-page";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const DETAIL_PAGE_COST = 2;

const SYSTEM_PROMPT = `이 의류 상품 이미지를 분석하여 쇼핑몰 상세페이지용 콘텐츠를 JSON으로 생성해주세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요:
{
  "subtitle": "영문 서브타이틀 (브랜드/컬렉션 느낌, 이탤릭체에 어울리는 2~4단어, 예: Cally Color Scheme)",
  "productName": "영문 상품명 (대문자, 세리프 폰트에 어울리는 2~4단어, 예: COLLAR CARDIGAN)",
  "catchphrase": "한글 캐치프레이즈 (1줄, 전문적이고 세련된 톤)",
  "description": "한글 상품 설명 (2~3문장, 소재감/핏/활용도를 전문적으로 서술)",
  "features": [
    {
      "title": "특징명 (한글, 2~4자, 예: 부드러운 촉감)",
      "description": "설명 (한글, 10~15자)",
      "svgIcon": "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'>단순 라인 아이콘, path 1~3개</svg>"
    }
  ]
}

규칙:
- features 배열에 정확히 4개의 항목을 포함하세요
- SVG는 24x24 viewBox, stroke 스타일만 사용, fill='none', path 1~3개로 간결하게
- 상품 이미지에서 보이는 디자인, 소재, 핏, 디테일을 기반으로 특징을 추출하세요
- subtitle은 영문으로, 상품 카테고리나 스타일을 반영한 감성적 문구
- productName은 영문 대문자로, 상품 종류를 정확히 반영

문체 규칙 (중요):
- catchphrase와 description은 반드시 전문적이고 세련된 패션 브랜드 톤으로 작성
- "~를 감싸다", "~를 선사합니다", "~해 보세요", "당신의~" 같은 촌스럽거나 광고성 문구 절대 사용 금지
- 좋은 예시: "배색 포인트가 돋보이는 카라 가디건", "데일리부터 오피스까지, 절제된 실루엣"
- 나쁜 예시: "당신을 감싸는 부드러움", "특별한 하루를 선사합니다", "매력에 빠져보세요"
- 객관적 서술 위주로, 소재감·핏·디테일을 간결하게 설명할 것`;

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId } = await getUserOrSessionId();
    const supabase = createServiceClient();

    // 무료 체험 한도 체크 (비로그인 사용자)
    const canProceed = await checkFreeTrialLimit(supabase, userId, sessionId);
    if (!canProceed) {
      return NextResponse.json(
        {
          success: false,
          error: "무료 체험 한도를 초과했습니다. 로그인 후 토큰을 충전해주세요.",
          code: "FREE_TRIAL_EXCEEDED",
        },
        { status: 403 },
      );
    }

    // 마스터 유저 확인
    let isMasterUser = false;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_master")
        .eq("id", userId)
        .single();
      if (profile?.is_master) isMasterUser = true;
    }

    const formData = await request.formData();
    const sourceFile = formData.get("sourceImage") as File | null;
    const fabric = (formData.get("fabric") as string) || "";
    const colors = (formData.get("colors") as string) || "";
    const sizes = (formData.get("sizes") as string) || "";
    const additionalContext =
      (formData.get("additionalContext") as string) || "";

    if (!sourceFile) {
      return NextResponse.json(
        { success: false, error: "상품 이미지가 필요합니다." },
        { status: 400 },
      );
    }

    const processed = await processImageFile(sourceFile);

    let contextLines = "";
    if (fabric) contextLines += `\n소재 정보: ${fabric}`;
    if (colors) contextLines += `\n컬러: ${colors}`;
    if (sizes) contextLines += `\n사이즈: ${sizes}`;
    if (additionalContext) contextLines += `\n추가 정보: ${additionalContext}`;

    const prompt = SYSTEM_PROMPT + (contextLines ? `\n\n참고 정보:${contextLines}` : "");

    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: processed.mimeType,
              data: processed.base64,
            },
          },
          { text: prompt },
        ],
        config: {
          responseMimeType: "application/json",
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("TIMEOUT: 30초 내 응답 없음")),
          30_000,
        ),
      ),
    ]);

    const text = response.candidates?.[0]?.content?.parts
      ?.filter((p) => "text" in p)
      .map((p) => ("text" in p ? p.text : ""))
      .join("");

    if (!text) {
      return NextResponse.json(
        { success: false, error: "AI 응답이 비어있습니다." },
        { status: 502 },
      );
    }

    const data: DetailPageGenerateResponse = JSON.parse(text);

    // 기본 검증
    if (
      !data.subtitle ||
      !data.productName ||
      !data.catchphrase ||
      !data.description ||
      !Array.isArray(data.features) ||
      data.features.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "AI 응답 형식이 올바르지 않습니다." },
        { status: 502 },
      );
    }

    // 토큰 차감 (마스터 유저 제외, 로그인 사용자만)
    let tokensSpent = 0;
    if (userId && !isMasterUser) {
      const { error: spendError } = await supabase.rpc("spend_tokens", {
        p_user_id: userId,
        p_amount: DETAIL_PAGE_COST,
        p_description: "상세페이지 빌더 생성",
        p_reference_id: null,
      });

      if (spendError) {
        if (spendError.message?.includes("TOKEN_INSUFFICIENT")) {
          return NextResponse.json(
            {
              success: false,
              error: "토큰이 부족합니다. 토큰을 충전해주세요.",
              code: "TOKEN_INSUFFICIENT",
            },
            { status: 402 },
          );
        }
        console.error("[detail-page/generate] Token spend error:", spendError);
      } else {
        tokensSpent = DETAIL_PAGE_COST;
      }
    }

    return NextResponse.json({ success: true, data, tokensSpent });
  } catch (error) {
    console.error("[detail-page/generate] Error:", error);

    if (error instanceof TokenInsufficientError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: "TOKEN_INSUFFICIENT",
        },
        { status: 402 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: "AI 응답을 파싱할 수 없습니다." },
        { status: 502 },
      );
    }

    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
