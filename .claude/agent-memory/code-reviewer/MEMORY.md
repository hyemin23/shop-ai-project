# Code Reviewer Memory — shop-ai-project (똑픽)

## 프로젝트 개요
동대문 의류 셀러 대상 AI 이미지 편집 B2B SaaS. Gemini API로 의류 교체/색상 변경/포즈 변경 구현.

## 핵심 파일 위치
- 타입: `types/studio.ts` (StudioType, GenerationMode, ImageGenerationOptions 등)
- 설정: `config/studio.ts` (프리셋 데이터), `config/prompts.ts` (Gemini 모델 ID, 프롬프트)
- Gemini 래퍼: `lib/gemini.ts` — `callGeminiWithImages()` + `callModel()` 내부 함수
- 공통 처리기: `lib/studio-processor.ts` — `processSingleStudioRequest()` (switch-case로 3개 타입 처리)
- 오류 시스템: `lib/errors.ts` — `StudioError`, `STUDIO_ERROR_CODES`
- API Routes: `app/api/studio/{try-on,color-swap,pose-transfer}/route.ts`
- 페이지: `app/(dashboard)/dashboard/studio/{page,color-swap/page,pose-transfer/page}.tsx`
- 공용 훅: `hooks/use-studio-generate.ts` — API 호출, 상태 관리, cooldown, 오프라인 처리
- 스튜디오 컴포넌트: `components/studio/` (ImageUploadZone, ResultViewer, ImageOptionsSelector, ModeSelector 등)

## 아키텍처 패턴
- API Route 3개가 거의 동일한 구조: formData 파싱 → processSingleStudioRequest → 에러 코드별 HTTP 상태 분기
- 페이지 3개가 거의 동일한 구조: useState 상태 관리 → handleGenerate(FormData 구성) → handleDownload(blob 다운로드) → handleRegenerate
- handleDownload 로직이 3개 페이지에 완전히 중복 (fetch → blob → a 태그 클릭 패턴)
- imageOptions 상태(`{aspectRatio: "1:1", imageSize: "1k"}` 초기값)가 3개 페이지에 중복

## 발견된 반복적 이슈 (2026-03-03 첫 리뷰)
1. **API Route 중복**: `aspectRatio/imageSize` formData 파싱 + HTTP 상태 코드 분기 로직 3곳 동일
2. **페이지 중복**: `handleDownload` 함수 3곳 완전 동일 → 커스텀 훅으로 추출 권장
3. **imageOptions 초기값 중복**: 3개 페이지에 `{aspectRatio: "1:1", imageSize: "1k"}` 하드코딩
4. **타입 캐스팅**: `formData.get("aspectRatio") as AspectRatio` — 유효성 검증 없는 단순 캐스팅
5. **`use client` 지시어 위치**: `result-viewer.tsx` 파일 최상단에 주석이 앞에 위치 (컨벤션 위반)
6. **ImageUploadZone handleRemove**: `onFileSelect?.(undefined as unknown as File)` — 타입 안전하지 않은 패턴, `onFileSelect` 시그니처를 `File | null`로 변경 권장

## gemini.ts 패턴
- `imageConfig` 객체 조건부 스프레드로 generationConfig에 중첩: `...(Object.keys(imageConfig).length > 0 && { imageConfig })`
- fallback: premium 모델 429/503/500 에러 시 standard 모델로 자동 재시도
- Sentry 캡처: fallback 성공 케이스는 캡처 안 함 (의도적)

## 보안 이슈 (2026-03-03 보안 점검)
1. **[CRITICAL] .mcp.json에 Supabase Personal Access Token 하드코딩**: `sbp_203c2e4cb3be8497cb4b64dc253d1e5b8c3c00eb` — 즉시 revoke 후 환경변수로 교체 필요. .gitignore에 `.mcp.json` 추가 필요.
2. **[HIGH] 웹훅 서명 검증 없음**: `app/api/payments/webhook/route.ts`가 Toss 웹훅 요청의 진위를 검증하지 않음 — TOSS_WEBHOOK_SECRET으로 HMAC 서명 검증 필요.
3. **[HIGH] middleware.ts 없음**: `lib/supabase/middleware.ts` 삭제됨, `proxy.ts`(루트)가 존재하나 Next.js `middleware.ts` 파일 자체가 없어 보호 라우트 미작동 가능성.
4. **[HIGH] RLS DELETE 정책 누락**: `studio_history` 테이블에 DELETE RLS 정책 없음 — 코드 레벨 소유자 검증으로 보완하나 DB 레벨 정책 필요.
5. **[MEDIUM] batch_jobs UPDATE 정책 과도 개방**: `WITH CHECK (true)`로 인증된 사용자가 타인의 배치 상태 변경 가능 (service_role로만 호출되어 현재는 안전하나 정책 자체가 취약).
6. **[MEDIUM] offset parseInt NaN 미방어**: `history/route.ts`, `tokens/transactions/route.ts`에서 `parseInt(offset)` NaN 체크 없음.
7. **[LOW] webhook console.log 디버그 코드**: `payments/webhook/route.ts:26` — `console.log("Payment canceled:", data.paymentKey)` 프로덕션 코드에 잔존.
8. **[LOW] getSessionIdFromHeader 미사용**: `lib/session.ts`에 export되나 실제 사용처 없음.

## 불필요한 파일 (커밋 제외 권장)
- `color-swap-result.png`, `test-model.png` — 테스트용 이미지 파일, 루트에 위치
- `shrimp_data/` — MCP shrimp task manager 데이터 디렉토리, .gitignore 추가 필요
- `proxy.ts` (루트) — `middleware.ts`를 대체한 임시 파일인지 확인 필요
- `.mcp.json` — 시크릿 토큰 포함, 절대 커밋 금지

## middleware 구조 (주의)
- `lib/supabase/middleware.ts` 삭제됨 (git tracked 상태에서 D)
- `lib/supabase/proxy.ts` 새로 추가됨 (동일 기능, 보호 라우트 범위 확장됨)
- `proxy.ts` (루트)가 `proxy.ts`를 import — 그러나 실제 `middleware.ts` 파일이 없어 Next.js가 미들웨어를 실행하지 않을 수 있음. 확인 필수.

## UI 컴포넌트 패턴 (2026-03-03 두 번째 리뷰)
- **Hydration 픽스 패턴**: `next-themes` 의존 컴포넌트는 `mounted` state + `useEffect(() => setMounted(true), [])` 패턴 사용. 미마운트 시 `<Skeleton>` 렌더링으로 CLS 방지.
- **ThemeToggle**: `components/theme-toggle.tsx` — mounted 가드로 Skeleton 렌더링. `resolvedTheme` 사용 (system 테마 해석 포함).
- **SiteHeader**: `components/marketing/site-header.tsx` — `!mounted || isLoading` 조건으로 인증 버튼 부분에 Skeleton 표시. ThemeToggle은 자체적으로 Skeleton을 처리하므로 SiteHeader에서는 별도 처리 불필요.
- **Button 디자인**: `components/ui/button.tsx` — `rounded-lg`, `font-semibold`, `shadow-md shadow-primary/25`, `hover:brightness-110`, `active:scale-[0.97]` 추가. link variant는 `active:scale-100`으로 scale 억제.
- **asChild + active:scale**: Slot이 `mergeProps`로 className을 병합하므로 Button의 `active:scale-[0.97]`이 자식 엘리먼트(Link)에 올바르게 전달됨. 정상 동작 확인.
- **Slot.Root vs Slot**: radix-ui의 `Slot` 네임스페이스에서 `Root`를 직접 import — `radix-ui` 패키지의 Slot.Root 사용 (shadcn 기본 패턴).
- **use-auth.ts**: `isLoading` 초기값 `true` — SSR에서 서버는 항상 isLoading=false, 클라이언트 첫 렌더는 true → hydration mismatch의 원인. `mounted` 가드가 이를 해결.
