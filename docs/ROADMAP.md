# 똑픽 (DDokPick) 개발 로드맵

동대문 의류 셀러를 위한 AI 이미지 편집 B2B SaaS -- 의류 교체/색상 변경/포즈 변경을 Gemini API로 구현, Supabase 인프라 통합.

## 개요

**똑픽**은 동대문 사입 기반 중소 의류 셀러가 촬영 없이도 고품질 상세페이지 이미지를 자체 생산할 수 있도록 하는 B2B SaaS이다.

- **의류 교체 (Virtual Try-On)**: Base 이미지 + Reference 의류 이미지 합성
- **색상 변경 (Color Swap)**: 원본 이미지의 의류 색상만 변경 (12색 프리셋 + HEX 커스텀)
- **포즈 변경 (Pose Transfer)**: 10종 포즈 프리셋 또는 참조 이미지 기반 포즈 변경
- **Gemini API 듀얼 모드**: Flash (기본/경제적) + Pro (고품질/4K) 모델, 자동 Fallback
- **Supabase 인프라**: DB (작업 히스토리), Storage (이미지 저장), Auth (Phase 4 소셜 로그인)
- **토큰 결제 (Phase 4)**: 토스 페이먼츠 연동, 선불 충전 방식

### 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 App Router, React 19, TypeScript strict |
| 스타일링 | Tailwind CSS 4, shadcn/ui (Radix UI + CVA) |
| AI | Google Gemini API (Flash + Pro 모델) |
| 인프라 | Supabase (PostgreSQL + Storage + Auth) |
| 결제 | 토스 페이먼츠 (Phase 4) |
| 패턴 | Config -> Type -> Component |

### 현재 프로젝트 상태

- Phase 1 완료: 애플리케이션 골격 구축 (Task 001~004)
- Phase 2 진행 중: UI/UX 완성 (Task 005, 007, 008, 009 완료 / Task 006, 010 부분 완료)
- 스튜디오 공통 컴포넌트 6개 완성: `components/studio/` (image-upload-zone, before-after-slider, result-viewer, processing-indicator, studio-layout, mode-selector)
- 스튜디오 페이지 UI 완성: 의류 교체, 색상 변경 (color-picker), 포즈 변경 (pose-preset-gallery)
- 작업 히스토리 페이지 완성: 필터링/정렬/빈 상태 UI + 더미 데이터 (`lib/dummy-data.ts`)
- 접근성 기본 적용: 반응형 레이아웃, 키보드 접근, aria-live, 터치 지원
- 미완료 항목: `public/dummy/` 더미 이미지 미배치 (Task 006), 데스크톱 권장 배너 미구현 (Task 010)
- 다음 단계: Task 006 더미 이미지 + Task 010 데스크톱 배너 완료 후 Phase 3 진입

---

## 개발 워크플로우

1. **작업 계획**: PRD 분석 -> 기능 분해 -> 의존성 매핑 -> 우선순위 결정
2. **작업 생성**: Task 단위 분해 -> `/tasks/XXX-description.md` 파일 생성 -> 구현 항목 정의
3. **작업 구현**: Task 파일의 구현 항목을 순서대로 완료 -> 완료 시 항목에 체크 표시
4. **로드맵 업데이트**: 완료된 Task에 체크 표시 -> `See: /tasks/XXX-xxx.md` 참조 추가 -> 다음 우선순위 Task 확인

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 (1주) ✅

> 전체 앱의 구조를 먼저 잡는다. 빈 페이지 셸, TypeScript 인터페이스, Config 파일, DB 스키마 설계를 완료하여 이후 UI/기능 개발의 토대를 마련한다.

#### ✅ Task 001: 정의하다 -- Studio TypeScript 인터페이스/타입 -- 전체 앱의 타입 안전성 확보 `See: /tasks/001-studio-types.md`

- ✅ `types/studio.ts` 생성: `StudioBaseRequest`, `StudioBaseResponse`, `TryOnRequest`, `ColorSwapRequest`, `PoseTransferRequest`, `StudioHistoryItem` 인터페이스
- ✅ `types/payment.ts` 생성: `Profile`, `TokenTransaction`, `TokenPackage` 인터페이스 (Phase 4 대비 선제 정의)
- ✅ `lib/errors.ts` 생성: `StudioError` 클래스 + `StudioErrorCode` 타입 + `STUDIO_ERROR_CODES` 상수 (`STUDIO_001` ~ `STUDIO_007`, 한국어 메시지)
- ✅ Gemini 모델 관련 타입: `GeminiModel`, `GenerationMode` (`"standard" | "premium"`)
- ✅ 처리 상태 타입: `StudioStatus` (`"idle" | "uploading" | "processing" | "success" | "error"`)
- ✅ 포즈 프리셋 타입: `PosePreset` (id, name, description, thumbnailUrl)
- ✅ 색상 프리셋 타입: `ColorPreset` (name, hex, nameKo)

**의존성**: 없음 (첫 번째 Task)
**산출물**: `types/studio.ts`, `types/payment.ts`, `lib/errors.ts`
**참조**: `@/docs/PRD.md` 5.4절 Request/Response 스키마, `@/types/index.ts` 기존 타입

---

#### ✅ Task 002: 확장하다 -- Config 파일 -- 스튜디오 설정값 중앙 관리 `See: /tasks/002-studio-config.md`

- ✅ `config/studio.ts` 생성: `POSE_PRESETS` 10종 목록, `COLOR_PRESETS` 12색 팔레트, `IMAGE_CONSTRAINTS` (최대 10MB, 512~4096px), 지원 포맷(JPG/PNG/WebP), `COOLDOWN_MS` (3초)
- ✅ `config/pricing.ts` 생성: `TOKEN_COST` (standard/premium x 3타입 x 해상도별 토큰 소모량), `TOKEN_PACKAGES` 3종 (Lite/Pro/Max), `FREE_TRIAL_TOKENS` (30토큰)
- ✅ `config/prompts.ts` 생성: Gemini 프롬프트 템플릿 함수 3개 (`tryOn`, `colorSwap`, `poseTransfer`), `GEMINI_MODELS` (standard->flash, premium->pro)
- ✅ `config/dashboard.ts` 검증: 기존 사이드바 메뉴 항목이 PRD 라우트 구조와 일치하는지 확인

**의존성**: Task 001 (타입 정의 참조)
**산출물**: `config/studio.ts`, `config/pricing.ts`, `config/prompts.ts`
**참조**: `@/docs/PRD.md` 6.2절 프롬프트 템플릿, 6.4절 가격 체계, `@/config/dashboard.ts`

---

#### ✅ Task 003: 생성하다 -- Route 구조 및 빈 페이지 셸 -- 전체 앱 네비게이션 완성 `See: /tasks/003-route-structure.md`

- ✅ `app/(dashboard)/dashboard/studio/page.tsx` 생성: 의류 교체 스튜디오 빈 셸 (제목 + Skeleton UI)
- ✅ `app/(dashboard)/dashboard/studio/color-swap/page.tsx` 생성: 색상 변경 스튜디오 빈 셸
- ✅ `app/(dashboard)/dashboard/studio/pose-transfer/page.tsx` 생성: 포즈 변경 스튜디오 빈 셸
- ✅ `app/(dashboard)/dashboard/history/page.tsx` 생성: 작업 히스토리 빈 셸
- ✅ `app/(dashboard)/dashboard/settings/page.tsx` 생성: 설정 빈 셸
- ✅ `app/api/studio/try-on/route.ts` 생성: POST 엔드포인트 스텁 (501 Not Implemented)
- ✅ `app/api/studio/color-swap/route.ts` 생성: POST 엔드포인트 스텁
- ✅ `app/api/studio/pose-transfer/route.ts` 생성: POST 엔드포인트 스텁
- ✅ `app/api/upload/route.ts` 생성: POST 엔드포인트 스텁
- ✅ `npm run build` 성공: 16개 라우트 정상 등록 확인

**의존성**: 없음 (기존 dashboard 레이아웃 활용)
**산출물**: 스튜디오 3개 페이지 + 히스토리/설정 페이지 + API Route 4개 스텁
**참조**: `@/app/(dashboard)/layout.tsx`, `@/config/dashboard.ts` 사이드바 메뉴 href 매핑

---

#### ✅ Task 004: 설계하다 -- Supabase DB 스키마 -- 데이터 모델 사전 확정 `See: /tasks/004-db-schema.md`

- ✅ `supabase/migrations/001_studio_history.sql` 생성: `studio_history` 테이블 DDL + RLS 정책 (session_id 기반) + 인덱스
- ✅ `supabase/migrations/002_users_and_tokens.sql` 생성: `profiles` 테이블 + `handle_new_user()` 자동 생성 트리거 + `token_transactions` 테이블 + RLS 정책
- ✅ `supabase/migrations/003_storage_buckets.sql` 생성: `studio-images` 공개 버킷 생성, 폴더 구조 (`source/`, `result/`, `thumb/`), 공개 읽기 + service_role 쓰기 정책
- ✅ `docs/SCHEMA.md` 생성: Mermaid ERD 다이어그램 + 테이블/RLS/Storage 문서

**의존성**: Task 001 (타입과 DB 스키마 정합성)
**산출물**: SQL 마이그레이션 파일 3개, 스키마 문서
**참조**: `@/docs/PRD.md` 6.4절 데이터 모델

---

### Phase 2: UI/UX 완성 -- 더미 데이터 활용 (1.5주)

> 모든 페이지의 UI를 더미 데이터로 완성한다. 실제 API 연동 없이 전체 사용자 흐름을 시각적으로 경험할 수 있도록 한다. 이 단계에서 디자인 피드백을 받아 조기에 반영한다.

#### ✅ Task 005: 구축하다 -- 공통 컴포넌트 라이브러리 -- 스튜디오 UI 재사용 기반 마련

- ✅ `components/studio/image-upload-zone.tsx` 생성: 드래그앤드롭 + 클릭 업로드 영역, 파일 유효성 검증 (크기/포맷/해상도), 프리뷰 표시, 키보드 접근 가능
- ✅ `components/studio/before-after-slider.tsx` 생성: 결과 비교 슬라이더 (드래그 핸들, 마우스/터치 지원)
- ✅ `components/studio/result-viewer.tsx` 생성: 결과 이미지 표시 + 다운로드 버튼 (PNG/JPG) + 재생성 버튼
- ✅ `components/studio/processing-indicator.tsx` 생성: 생성 중 로딩 상태 (프로그레스 인디케이터, aria-live 안내)
- ✅ `components/studio/studio-layout.tsx` 생성: 스튜디오 공통 레이아웃 (입력 영역 + 결과 영역 2단 구조)
- ✅ `components/studio/mode-selector.tsx` 생성: 기본 모드/고품질 모드 선택 UI (Switch 또는 RadioGroup)
- ✅ 추가 shadcn/ui 컴포넌트 설치 필요 시 `npx shadcn@latest add` 실행

**의존성**: Task 001 (타입), Task 002 (Config 설정값 참조)
**산출물**: `components/studio/` 하위 6개 컴포넌트
**참조**: `@/docs/PRD.md` 5.3절 UI/UX 와이어프레임, `@/components/ui/` shadcn 컴포넌트

---

#### Task 006: 구현하다 -- 의류 교체 스튜디오 UI -- 더미 데이터 기반 전체 화면 완성

- ✅ `app/(dashboard)/dashboard/studio/page.tsx` 업데이트: 의류 교체 전용 레이아웃 적용
- ✅ Base 이미지 업로드 영역: `ImageUploadZone` 컴포넌트 연결 ("모델 사진을 업로드하세요")
- ✅ Reference 이미지 업로드 영역: `ImageUploadZone` 컴포넌트 연결 ("교체할 의류 사진을 업로드하세요")
- ✅ "생성하기" 버튼: 클릭 시 더미 로딩 (3초) -> 더미 결과 이미지 표시
- ✅ 결과 영역: `BeforeAfterSlider` + `ResultViewer` 컴포넌트 연결
- ✅ `ModeSelector` 컴포넌트: 기본/고품질 모드 선택 UI 배치
- 더미 데이터: `/public/dummy/` 디렉토리에 샘플 이미지 배치

**의존성**: Task 003 (페이지 셸), Task 005 (공통 컴포넌트)
**산출물**: 의류 교체 스튜디오 완성 화면 (더미)
**참조**: `@/docs/PRD.md` 5-A절 의류 교체 UI 와이어프레임

---

#### ✅ Task 007: 구현하다 -- 색상 변경 스튜디오 UI -- 더미 데이터 기반 전체 화면 완성

- ✅ `app/(dashboard)/dashboard/studio/color-swap/page.tsx` 업데이트: 색상 변경 전용 레이아웃 적용
- ✅ 원본 이미지 업로드 영역: `ImageUploadZone` 컴포넌트 연결
- ✅ `components/studio/color-picker.tsx` 생성: 12색 프리셋 팔레트 그리드 + HEX 입력 필드 + 실시간 색상 프리뷰
- ✅ 의류 영역 표시: 프리뷰에서 의류 영역 하이라이트 (더미 오버레이)
- ✅ "색상 변경" 버튼: 더미 로딩 -> 더미 결과 이미지 표시
- ✅ 결과 영역: `BeforeAfterSlider` + `ResultViewer`

**의존성**: Task 003 (페이지 셸), Task 005 (공통 컴포넌트), Task 002 (색상 프리셋 Config)
**산출물**: 색상 변경 스튜디오 완성 화면 (더미), `components/studio/color-picker.tsx`
**참조**: `@/docs/PRD.md` 5-B절 색상 변경 UI 와이어프레임

---

#### ✅ Task 008: 구현하다 -- 포즈 변경 스튜디오 UI -- 더미 데이터 기반 전체 화면 완성

- ✅ `app/(dashboard)/dashboard/studio/pose-transfer/page.tsx` 업데이트: 포즈 변경 전용 레이아웃 적용
- ✅ 원본 이미지 업로드 영역: `ImageUploadZone` 컴포넌트 연결
- ✅ `components/studio/pose-preset-gallery.tsx` 생성: 10종 포즈 프리셋 썸네일 그리드 (선택 시 하이라이트), 커스텀 포즈 이미지 업로드 탭
- ✅ "포즈 변경" 버튼: 더미 로딩 -> 더미 결과 이미지 표시
- ✅ 결과 영역: `BeforeAfterSlider` + `ResultViewer`

**의존성**: Task 003 (페이지 셸), Task 005 (공통 컴포넌트), Task 002 (포즈 프리셋 Config)
**산출물**: 포즈 변경 스튜디오 완성 화면 (더미), `components/studio/pose-preset-gallery.tsx`
**참조**: `@/docs/PRD.md` 5-C절 포즈 변경 UI 와이어프레임

---

#### ✅ Task 009: 구현하다 -- 작업 히스토리 페이지 UI -- 더미 데이터 기반 목록/상세 화면

- ✅ `app/(dashboard)/dashboard/history/page.tsx` 업데이트: 히스토리 목록 UI
- ✅ 히스토리 카드 컴포넌트: 썸네일(Before/After), 작업 유형 Badge, 생성 일시, 모델 정보, 처리 시간
- ✅ 필터링: 작업 유형별 (전체/의류교체/색상변경/포즈변경), 날짜 범위
- ✅ 정렬: 최신순/오래된순
- ✅ 상세 보기: 카드 클릭 시 Dialog 또는 페이지 전환으로 원본/결과 이미지 큰 화면 표시
- ✅ 더미 데이터: 10~15건의 샘플 히스토리 항목 (`lib/dummy-data.ts`)
- ✅ 빈 상태 UI: 히스토리가 없을 때 안내 메시지 + 스튜디오 바로가기

**의존성**: Task 003 (페이지 셸), Task 001 (`StudioHistoryItem` 타입)
**산출물**: 히스토리 페이지 완성 화면 (더미)
**참조**: `@/docs/PRD.md` 6.4절 `studio_history` 테이블 구조

---

#### Task 010: 적용하다 -- 접근성 및 반응형 디자인 -- WCAG 2.1 AA 준수 및 모바일 대응

- ✅ 전체 스튜디오 페이지 반응형 레이아웃: 데스크톱 2단 -> 모바일 1단 스택
- ✅ 이미지 업로드 영역 키보드 접근: Tab/Enter/Space로 파일 선택 가능
- ✅ 로딩 상태 `aria-live="polite"` 안내: "이미지를 생성하고 있습니다..."
- ✅ 색상 대비 WCAG 2.1 AA 검증 (shadcn/ui 기본 테마 기반)
- ✅ 결과 이미지 `alt` 텍스트: 작업 유형 + 생성 일시 조합
- ✅ 모바일 웹 터치 지원: BeforeAfterSlider 터치 드래그, 업로드 영역 탭 인터랙션
- 데스크톱 권장 안내 배너: 모바일에서 스튜디오 접근 시 "데스크톱에서 더 편리하게 사용하세요" 표시

**의존성**: Task 005~009 (모든 UI 컴포넌트 완성 후)
**산출물**: 전체 스튜디오 접근성/반응형 검증 완료
**참조**: `@/docs/PRD.md` 8절 비기능 요구사항 (접근성, 브라우저)

---

### Phase 3: 핵심 기능 구현 (2주)

> 더미 데이터를 실제 API/DB로 교체한다. Supabase 인프라 연결, Gemini API 통합, 이미지 파이프라인 구축, 에러 처리를 완성하여 실제 동작하는 MVP를 만든다.

#### Task 011: 설정하다 -- Supabase 클라이언트 및 DB 연결 -- 인프라 기반 구축

- `lib/supabase/client.ts` 생성: `createBrowserClient()` (클라이언트 컴포넌트용, `@supabase/ssr`)
- `lib/supabase/server.ts` 생성: `createServerClient()` (서버 컴포넌트/API Route용, `@supabase/ssr`)
- `lib/supabase/middleware.ts` 생성: 세션 갱신 미들웨어 (Phase 4 Auth 대비)
- `middleware.ts` (루트): Supabase 미들웨어 통합
- Supabase 프로젝트에 `supabase/migrations/001_studio_history.sql` 적용 (MCP 도구 또는 대시보드)
- Supabase Storage `studio-images` 버킷 생성 및 정책 설정
- 환경변수 검증: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 존재 확인
- 연결 테스트: DB 쿼리 + Storage 업로드/다운로드 동작 확인

**의존성**: Task 004 (DB 스키마 설계 완료)
**산출물**: `lib/supabase/` 3개 파일, `middleware.ts`, Supabase 프로젝트 인프라 구축
**참조**: `@/docs/PRD.md` 6.1절 시스템 구성도, `@/.env.example`

## 테스트 체크리스트
- [ ] Supabase 브라우저 클라이언트로 `studio_history` 테이블 SELECT 성공
- [ ] Supabase 서버 클라이언트(service_role)로 `studio_history` INSERT 성공
- [ ] Storage 버킷에 테스트 이미지 업로드/다운로드 성공
- [ ] RLS 정책 동작 확인: session_id 기반 접근 제어

---

#### Task 012: 통합하다 -- Gemini API -- Flash/Pro 듀얼 모드 및 프롬프트 엔지니어링

- `lib/gemini.ts` 생성: Gemini API 클라이언트 래퍼 (`@google/generative-ai` SDK 사용)
- `callGeminiWithMode()` 함수: standard(Flash)/premium(Pro) 모드 선택, 자동 Fallback 로직
- `isOverloadOrRateLimit()` 함수: HTTP 429/503/500 판별
- 프롬프트 적용: `config/prompts.ts`의 템플릿을 각 기능별로 주입
- 이미지 전처리: Base64 인코딩, 최대 2048px 리사이즈 후 전송
- 응답 파싱: Gemini 응답에서 이미지 데이터 추출, Base64 디코딩
- Rate Limiting: 클라이언트 측 3초 쿨다운 디바운싱
- 에러 핸들링: `StudioError` 타입 기반 구조화된 에러 반환

**의존성**: Task 001 (타입), Task 002 (프롬프트/모델 Config)
**산출물**: `lib/gemini.ts`
**참조**: `@/docs/PRD.md` 6.2절 Gemini API 연동 설계, Fallback 전략

## 테스트 체크리스트
- [ ] Flash 모델로 의류 교체 이미지 생성 성공
- [ ] Pro 모델로 의류 교체 이미지 생성 성공
- [ ] Pro 모델 실패 시 Flash Fallback 동작 확인
- [ ] 잘못된 이미지 입력 시 구조화된 에러 반환
- [ ] 3초 쿨다운 디바운싱 동작 확인

---

#### Task 013: 구축하다 -- 이미지 업로드/저장 파이프라인 -- Supabase Storage 연동

- `lib/image-utils.ts` 생성: 이미지 리사이즈 (최대 2048px), Base64 변환, 포맷 변환, 썸네일 생성 (200px)
- `app/api/upload/route.ts` 구현: FormData 수신 -> 유효성 검증 (크기/포맷/해상도) -> Supabase Storage 업로드 -> URL 반환
- 업로드 경로 전략: `studio-images/source/{session_id}/{uuid}.{ext}`
- 결과 이미지 저장: `studio-images/result/{session_id}/{uuid}.{ext}`
- 썸네일 저장: `studio-images/thumb/{session_id}/{uuid}.{ext}` (200px 리사이즈)
- 세션 ID 관리: 쿠키 기반 UUID 발급 및 유지 (`lib/session.ts`)
- Zod 스키마 검증: 파일 크기 (최대 10MB), 포맷 (JPG/PNG/WebP), 해상도 (512~4096px)

**의존성**: Task 011 (Supabase Storage 연결)
**산출물**: `lib/image-utils.ts`, `lib/session.ts`, `app/api/upload/route.ts` 완성
**참조**: `@/docs/PRD.md` 6.1절 이미지 저장 전략, Storage 버킷 구조

## 테스트 체크리스트
- [ ] 10MB 이하 JPG/PNG/WebP 이미지 업로드 성공
- [ ] 10MB 초과 이미지 업로드 시 에러 반환
- [ ] 지원하지 않는 포맷 업로드 시 에러 반환
- [ ] 업로드된 이미지 URL로 접근 가능 확인
- [ ] 썸네일 (200px) 자동 생성 확인
- [ ] 세션 ID 쿠키 생성/유지 확인

---

#### Task 014: 구현하다 -- Studio API Routes -- 3가지 이미지 생성 엔드포인트

- `app/api/studio/try-on/route.ts` 구현: POST 요청 처리 -> 이미지 검증 -> Gemini API 호출 -> 결과 Storage 저장 -> 히스토리 DB 기록 -> 응답 반환
- `app/api/studio/color-swap/route.ts` 구현: 원본 이미지 + 목표 색상(HEX) + 영역(auto/top/bottom/dress) 처리
- `app/api/studio/pose-transfer/route.ts` 구현: 원본 이미지 + 포즈(프리셋 ID 또는 참조 이미지) 처리
- 공통 미들웨어: 요청 검증 (Zod), 세션 확인, 처리 시간 측정
- 히스토리 기록: `studio_history` 테이블에 메타데이터 저장 (소스/결과 URL, 파라미터, 모델 정보, Fallback 여부)
- `app/api/history/route.ts` 생성: GET (세션별 히스토리 조회, 페이지네이션), DELETE (개별 히스토리 삭제)
- 응답 형식: `StudioBaseResponse` 타입 준수

**의존성**: Task 011 (Supabase DB), Task 012 (Gemini API), Task 013 (이미지 파이프라인)
**산출물**: API Route 4개 완성 + 히스토리 CRUD API
**참조**: `@/docs/PRD.md` 5.4절 API 설계, 에러 핸들링 전략

## 테스트 체크리스트
- [ ] `/api/studio/try-on` POST: Base + Reference 이미지 -> 결과 이미지 URL 반환
- [ ] `/api/studio/color-swap` POST: 원본 이미지 + HEX 색상 -> 결과 이미지 URL 반환
- [ ] `/api/studio/pose-transfer` POST: 원본 이미지 + 프리셋 ID -> 결과 이미지 URL 반환
- [ ] `/api/history` GET: 세션별 히스토리 목록 반환 (최신순)
- [ ] `/api/history` DELETE: 특정 히스토리 삭제 성공
- [ ] 잘못된 입력 시 적절한 에러 코드 + 메시지 반환
- [ ] 히스토리에 모델 정보, Fallback 여부 기록 확인

---

#### Task 015: 전환하다 -- UI-API 연결 -- 더미 데이터에서 실제 API 호출로 교체

- 의류 교체 페이지: 더미 로딩 -> 실제 `/api/studio/try-on` 호출 + 결과 표시
- 색상 변경 페이지: 더미 -> 실제 `/api/studio/color-swap` 호출
- 포즈 변경 페이지: 더미 -> 실제 `/api/studio/pose-transfer` 호출
- 히스토리 페이지: 더미 데이터 -> 실제 `/api/history` 조회 + 페이지네이션
- `hooks/use-studio-generate.ts` 생성: 이미지 생성 커스텀 훅 (업로드 -> API 호출 -> 상태 관리 -> 결과 반환)
- `hooks/use-studio-history.ts` 생성: 히스토리 조회 커스텀 훅 (목록 조회 + 삭제 + 필터링)
- 이미지 업로드 연결: `ImageUploadZone` -> `/api/upload` -> Storage URL 수신
- 다운로드 기능: 결과 이미지 URL에서 Blob 다운로드 (PNG/JPG 선택)

**의존성**: Task 006~009 (UI 완성), Task 014 (API Routes 완성)
**산출물**: 전체 스튜디오 실제 동작 연결 완료
**참조**: `@/docs/PRD.md` 6.3절 상태 관리

## 테스트 체크리스트
- [ ] 의류 교체: 이미지 업로드 -> 생성 -> 결과 표시 -> 다운로드 전체 플로우
- [ ] 색상 변경: 이미지 업로드 -> 색상 선택 -> 생성 -> 결과 표시 전체 플로우
- [ ] 포즈 변경: 이미지 업로드 -> 프리셋 선택 -> 생성 -> 결과 표시 전체 플로우
- [ ] 히스토리: 실제 생성 내역이 히스토리에 표시되는지 확인
- [ ] 재생성 버튼 동작 확인

---

#### Task 016: 강화하다 -- 에러 처리 및 로딩 상태 -- 안정적 사용자 경험 보장

- 클라이언트 에러 처리: 파일 크기 초과, 지원하지 않는 포맷, 해상도 부적합 -> toast 알림
- 서버 에러 처리: Gemini API 타임아웃 (60초), Rate Limit, 내부 오류 -> 재시도 버튼 표시
- Retryable 에러 자동 재시도: `STUDIO_004`, `STUDIO_005`, `STUDIO_006` -> 최대 2회, 지수 백오프 (2초, 4초)
- Non-retryable 에러 즉시 안내: `STUDIO_001`~`STUDIO_003`, `STUDIO_007` -> 사용자 친화적 메시지
- 로딩 상태 UI: Skeleton, Spinner, 프로그레스 바, 예상 대기 시간 표시
- 네트워크 오프라인 감지: 오프라인 시 생성 버튼 비활성화 + 안내
- Fallback 안내 toast: 고품질 모드에서 Flash Fallback 발생 시 "기본 모델로 생성되었습니다" 표시
- 연속 클릭 방지: 생성 버튼 3초 쿨다운 (디바운싱)

**의존성**: Task 015 (UI-API 연결 완료 후)
**산출물**: 전체 에러 처리 + 로딩 상태 완성
**참조**: `@/docs/PRD.md` 5.2절 에러 케이스, 6.2절 Fallback 전략, `@/lib/errors.ts`

## 테스트 체크리스트
- [ ] 10MB 초과 파일 업로드 시 토스트 알림 표시
- [ ] API 타임아웃 시 재시도 버튼 표시 + 자동 재시도 동작
- [ ] Rate Limit 초과 시 대기 안내 메시지 표시
- [ ] 의류 영역 감지 실패 시 적절한 안내 메시지
- [ ] 고품질 -> Flash Fallback 시 토스트 알림 확인
- [ ] 오프라인 상태에서 생성 버튼 비활성화 확인
- [ ] 연속 클릭 시 3초 쿨다운 동작 확인

---

### Phase 4: 고급 기능 및 최적화 (4-6주)

> MVP 핵심 기능 완성 후, 인증/결제/배치 처리 등 고급 기능을 추가하고 성능을 최적화한다. Phase 2(PRD 기준)의 소셜 로그인, 토큰 결제를 이 단계에서 구현한다.

#### Task 017: 구현하다 -- Supabase Auth 소셜 로그인 -- 카카오/구글 OAuth 연동

- Supabase 대시보드에서 Kakao, Google OAuth Provider 활성화 (클라이언트 ID/Secret 설정)
- `app/(auth)/login/page.tsx` 업데이트: 카카오/구글 소셜 로그인 버튼 연동 (Supabase Auth signInWithOAuth)
- `app/(auth)/register/page.tsx` 업데이트: 소셜 회원가입 플로우 (Supabase Auth 자동 처리)
- `app/(auth)/callback/route.ts` 생성: OAuth 콜백 처리 (code -> session 교환)
- `supabase/migrations/002_users_and_tokens.sql` 적용: `profiles` 테이블 + `handle_new_user()` 트리거
- 세션 관리: `@supabase/ssr` 미들웨어로 쿠키 기반 세션 갱신
- 기존 세션 데이터 마이그레이션: `link_session_to_user()` 함수로 session_id -> user_id 연결
- 로그인/비로그인 분기: 로그인 시 user_id 기반, 비로그인 시 기존 session_id 기반 유지

**의존성**: Task 011 (Supabase 클라이언트), Task 015 (기능 동작 완료)
**산출물**: 소셜 로그인 완성, `profiles` 테이블 연동
**참조**: `@/docs/PRD.md` 9절 Phase 2-A 소셜 로그인

## 테스트 체크리스트
- [ ] 카카오 로그인 -> 프로필 자동 생성 확인
- [ ] 구글 로그인 -> 프로필 자동 생성 확인
- [ ] 로그인 후 기존 세션 히스토리가 user_id에 연결되는지 확인
- [ ] 로그아웃 -> 재로그인 시 세션 유지 확인
- [ ] 비로그인 사용자도 스튜디오 이용 가능 확인

---

#### Task 018: 연동하다 -- 토스 페이먼츠 결제 -- 토큰 충전 결제 플로우

- `lib/toss.ts` 생성: 토스 페이먼츠 API 클라이언트 (결제 요청, 결제 승인, 결제 취소)
- `app/(dashboard)/dashboard/tokens/page.tsx` 생성: 토큰 충전 페이지 UI (패키지 선택 + 토스 결제 위젯)
- `app/api/payments/confirm/route.ts` 생성: 결제 승인 API (토스 서버 -> 우리 서버 -> 토큰 충전)
- `app/api/payments/webhook/route.ts` 생성: 토스 웹훅 처리 (결제 상태 변경 알림)
- `app/api/tokens/route.ts` 생성: GET (잔액 조회), POST (토큰 차감)
- 토큰 차감 로직: 이미지 생성 시 모드/해상도에 따른 토큰 소모 (`config/pricing.ts` 참조)
- 토큰 부족 시 충전 유도: 잔액 부족 -> 모달로 충전 페이지 안내
- Fallback 토큰 환불: 고품질 -> Flash Fallback 시 차액 자동 환불 로직

**의존성**: Task 017 (인증 완료 -- 결제는 로그인 사용자만)
**산출물**: 토큰 충전 결제 플로우 완성
**참조**: `@/docs/PRD.md` 9절 Phase 2-B 토큰 결제 시스템, `@/config/pricing.ts`

## 테스트 체크리스트
- [ ] 토큰 패키지 선택 -> 토스 결제 -> 토큰 충전 전체 플로우
- [ ] 결제 취소 시 토큰 미충전 확인
- [ ] 이미지 생성 시 토큰 차감 확인 (모드/해상도별 정확한 양)
- [ ] 토큰 부족 시 충전 유도 모달 표시
- [ ] Fallback 발생 시 토큰 차액 환불 확인
- [ ] 토스 웹훅으로 결제 상태 동기화 확인

---

#### Task 019: 구현하다 -- 토큰 관리 UI -- 잔액/충전/사용 내역 대시보드

- 헤더 토큰 잔액 표시: `DashboardHeader`에 토큰 잔액 Badge 추가
- `app/(dashboard)/dashboard/tokens/page.tsx` 확장: 사용 내역 목록 (테이블), 필터링 (유형별: 충전/소모/보너스), 날짜 범위 선택
- 토큰 사용 통계: 이번 달 사용량, 기능별 사용 비율 차트 (간단한 Bar 차트)
- 충전 버튼: 패키지 선택 모달 -> 토스 결제 연동
- 무료 체험 안내: 신규 가입 사용자에게 30토큰 무료 체험 배너
- 프로필 페이지: `app/(dashboard)/dashboard/settings/page.tsx` 업데이트 -- 프로필 정보 표시, 로그아웃

**의존성**: Task 017 (인증), Task 018 (결제)
**산출물**: 토큰 관리 대시보드 완성
**참조**: `@/docs/PRD.md` 9절 Phase 2-B, `@/types/payment.ts`

---

#### Task 020: 구현하다 -- 배치 처리 -- 다중 이미지 동시 처리 큐

- 다중 이미지 업로드: 최대 10장 동시 선택/업로드 UI
- 처리 큐: 서버 측 순차 처리 (Gemini API Rate Limit 고려)
- 진행 상태: 전체 진행률 + 개별 이미지 상태 표시 (대기/처리중/완료/실패)
- 결과 일괄 다운로드: ZIP 파일로 결과 이미지 일괄 다운로드
- 부분 실패 처리: 실패한 이미지만 재시도 가능
- 배치 히스토리: 배치 단위로 히스토리 그룹핑

**의존성**: Task 014 (API Routes), Task 015 (UI-API 연결)
**산출물**: 배치 처리 기능 완성
**참조**: `@/docs/PRD.md` 4절 Out of Scope (Phase 2 범위)

---

#### Task 021: 최적화하다 -- 성능 및 모니터링 -- 프로덕션 안정성 확보

- 이미지 최적화: 클라이언트 측 사전 리사이즈 (최대 2048px), WebP 변환, lazy loading
- API 응답 캐싱: 동일 파라미터 요청 캐싱 (LRU, 선택적)
- Supabase 쿼리 최적화: 인덱스 효율성 검증, 쿼리 플랜 분석
- Google Cloud Billing 알림: 일일/월간 예산 알림 설정
- 에러 모니터링: Sentry 또는 Supabase Logs 기반 에러 추적
- 성능 메트릭: 생성 성공률, 평균 응답 시간, 다운로드율 추적
- CI/CD: GitHub Actions 파이프라인 (lint -> build -> deploy)
- SEO 최적화: 마케팅 페이지 메타 태그, Open Graph, 구조화된 데이터

**의존성**: Phase 3 전체 완료
**산출물**: 프로덕션 배포 준비 완료
**참조**: `@/docs/PRD.md` 8절 비기능 요구사항, 11절 성공 지표

---

## 주요 의존성 그래프

```
Phase 1 (골격)
  Task 001 (타입) ──────┬──> Task 002 (Config)
                        ├──> Task 005 (공통 컴포넌트) [Phase 2]
                        └──> Task 009 (히스토리 UI) [Phase 2]
  Task 003 (Routes) ────┬──> Task 006 (의류교체 UI) [Phase 2]
                        ├──> Task 007 (색상변경 UI) [Phase 2]
                        ├──> Task 008 (포즈변경 UI) [Phase 2]
                        └──> Task 009 (히스토리 UI) [Phase 2]
  Task 004 (DB 스키마) ─┬──> Task 011 (Supabase 연결) [Phase 3]
                        └──> (Phase 4 마이그레이션 적용)

Phase 2 (UI)
  Task 005 (공통) ──────┬──> Task 006 (의류교체)
                        ├──> Task 007 (색상변경)
                        ├──> Task 008 (포즈변경)
                        └──> Task 009 (히스토리)
  Task 006~009 ─────────┬──> Task 010 (접근성) [Phase 2 마무리]
                        └──> Task 015 (UI-API 연결) [Phase 3]

Phase 3 (기능)
  Task 011 (Supabase) ──┬──> Task 013 (이미지 파이프라인)
                        └──> Task 014 (API Routes)
  Task 012 (Gemini) ────┬──> Task 014 (API Routes)
  Task 013 (이미지) ────┤
  Task 014 (API) ───────┬──> Task 015 (UI-API 연결)
  Task 015 (연결) ──────┬──> Task 016 (에러 처리)
                        └──> Task 017 (인증) [Phase 4]

Phase 4 (고급)
  Task 017 (인증) ──────┬──> Task 018 (결제)
  Task 018 (결제) ──────┬──> Task 019 (토큰 UI)
  Task 015 (연결) ──────┬──> Task 020 (배치)
  Phase 3 전체 ─────────┬──> Task 021 (최적화)
```

## 병렬 작업 가이드

| 기간 | 프론트엔드 | 백엔드 |
|------|-----------|--------|
| 1주차 | Task 001, 002, 003 (골격) | Task 004 (DB 스키마 설계) |
| 2주차 | Task 005 (공통 컴포넌트) | Task 011 (Supabase 설정) |
| 2~3주차 | Task 006, 007, 008 (스튜디오 UI) | Task 012, 013 (Gemini + 이미지) |
| 3주차 | Task 009 (히스토리 UI) | Task 014 (API Routes) |
| 3~4주차 | Task 010 (접근성) | Task 015 (UI-API 연결) |
| 4주차 | Task 016 (에러 처리) | Task 016 (에러 처리) |
| 5~6주차 | Task 017 (인증 UI) | Task 017 (인증 백엔드) |
| 7~8주차 | Task 019 (토큰 UI) | Task 018 (결제 연동) |
| 9~10주차 | Task 020 (배치 UI) | Task 020 (배치 큐) |
| 10주차+ | Task 021 (성능 최적화) | Task 021 (모니터링) |

---

## 파일 생성 계획 요약

### Phase 1에서 생성되는 파일

```
types/studio.ts                              # Task 001
types/payment.ts                             # Task 001
lib/errors.ts                                # Task 001
config/studio.ts                             # Task 002
config/pricing.ts                            # Task 002
config/prompts.ts                            # Task 002
app/(dashboard)/dashboard/studio/page.tsx    # Task 003 (신규/업데이트)
app/(dashboard)/dashboard/studio/color-swap/page.tsx   # Task 003
app/(dashboard)/dashboard/studio/pose-transfer/page.tsx # Task 003
app/(dashboard)/dashboard/history/page.tsx   # Task 003
app/(dashboard)/dashboard/settings/page.tsx  # Task 003
app/api/studio/try-on/route.ts              # Task 003 (스텁)
app/api/studio/color-swap/route.ts          # Task 003 (스텁)
app/api/studio/pose-transfer/route.ts       # Task 003 (스텁)
app/api/upload/route.ts                     # Task 003 (스텁)
supabase/migrations/001_studio_history.sql  # Task 004
supabase/migrations/002_users_and_tokens.sql # Task 004
supabase/migrations/003_storage_buckets.sql # Task 004
docs/SCHEMA.md                              # Task 004
```

### Phase 2에서 생성되는 파일

```
components/studio/image-upload-zone.tsx      # Task 005
components/studio/before-after-slider.tsx    # Task 005
components/studio/result-viewer.tsx          # Task 005
components/studio/processing-indicator.tsx   # Task 005
components/studio/studio-layout.tsx          # Task 005
components/studio/mode-selector.tsx          # Task 005
components/studio/color-picker.tsx           # Task 007
components/studio/pose-preset-gallery.tsx    # Task 008
public/dummy/                               # Task 006~009 (더미 이미지)
lib/dummy-data.ts                           # Task 009
```

### Phase 3에서 생성되는 파일

```
lib/supabase/client.ts                      # Task 011
lib/supabase/server.ts                      # Task 011
lib/supabase/middleware.ts                   # Task 011
middleware.ts                               # Task 011
lib/gemini.ts                               # Task 012
lib/image-utils.ts                          # Task 013
lib/session.ts                              # Task 013
hooks/use-studio-generate.ts                # Task 015
hooks/use-studio-history.ts                 # Task 015
```

### Phase 4에서 생성되는 파일

```
app/(auth)/callback/route.ts                # Task 017
lib/toss.ts                                 # Task 018
app/(dashboard)/dashboard/tokens/page.tsx   # Task 018
app/api/payments/confirm/route.ts           # Task 018
app/api/payments/webhook/route.ts           # Task 018
app/api/tokens/route.ts                     # Task 018
app/api/history/route.ts                    # Task 014 (Phase 3)
```
