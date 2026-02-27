# MVP PRD 생성 메타 프롬프트

> 이 프롬프트를 AI에게 입력하면, 쇼핑몰 상세페이지 AI 자동화 프로젝트의 MVP PRD 문서를 생성합니다.

---

## 프롬프트

```
당신은 시니어 프로덕트 매니저이자 AI/ML 제품 전문가입니다.
아래 컨텍스트를 바탕으로 MVP PRD(Product Requirements Document)를 작성해주세요.

---

## 프로젝트 컨텍스트

### 제품 개요
- 제품명: [똑픽]
- 목적: 쇼핑몰 상세페이지 이미지를 AI로 자동 생성/편집하여, 촬영 비용과 시간을 획기적으로 줄이는 B2B SaaS
- 핵심 AI 엔진: Google Gemini API — Primary: Nano Banana Pro (`gemini-3-pro-image-preview`), Fallback: Nano Banana (`gemini-2.5-flash-image`)
- 타겟 사용자:
-동대문 사입 기반 국내 중소 의류 쇼핑몰 운영자
-1인 또는 소규모 팀으로 운영되는 스마트스토어, 에이블리, 하이버 셀러
-촬영 비용 부담이 큰 초기 셀러
-상세페이지 제작을 외주 대신 직접 해결하고 싶은 운영자
-다품종 소량 업로드가 필요한 트렌디 의류 셀러

### 기술 스택 (기존 프로젝트)
- Frontend: Next.js 16 App Router, React 19, TypeScript strict mode
- UI: shadcn/ui (Radix UI + Tailwind CSS 4 + CVA), 다크모드 지원
- Form: React Hook Form + Zod + shadcn Form + sonner toast
- 패턴: Config → Type → Component (config/ → types/ → components/)
- Route Groups: (marketing), (auth), (dashboard)
- Claude Code Hooks: `.claude/settings.local.json`에 정의된 Hook 시스템
  - **SessionStart** — `.env.local`에서 `SLACK_WEBHOOK_URL`을 환경변수로 로드
  - **Notification** — 권한 요청 시 Slack `#starter-kit-noti` 채널 알림 전송
  - **Stop** — 작업 완료 시 Slack 알림 전송
  - **PreToolUse** — `git commit` 감지 시 `npm run lint` + `npm run build` 검증, 실패 시 커밋 차단
  - 스크립트: `.claude/hooks/notify-slack.sh`
- 환경변수: `.env.local`에 `SLACK_WEBHOOK_URL`, `GEMINI_API_KEY` 설정
- 상태: 인증 플레이스홀더만 존재, API/DB 미설정
- **Phase 2 예정 스택**:
  - 인증: NextAuth.js (Auth.js) — 카카오 OAuth + 구글 OAuth
  - 결제: 토스 페이먼츠 API (TossPayments) — 토큰 기반 선불 충전
  - DB: Supabase (PostgreSQL + Storage)
  - 추가 환경변수: `KAKAO_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `NEXTAUTH_SECRET`, `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`

---

## 핵심 기능 3가지

### 기능 1: 의류 교체 (Virtual Try-On)
- 설명: Base 이미지(모델 착용 사진)에서 의류 영역을 감지하고, Reference 이미지의 의류로 자연스럽게 교체
- 입력: Base 이미지 1장 + Reference 의류 이미지 1장
- 출력: 의류가 교체된 합성 이미지
- 핵심 과제: 체형/포즈에 맞는 자연스러운 피팅, 주름/그림자/질감 보존

### 기능 2: 의류 색상 변경 (Color Swap)
- 설명: 특정 의류 아이템의 색상만 변경하고, 나머지 요소(배경, 모델, 다른 의류)는 유지
- 입력: 원본 이미지 1장 + 대상 의류 영역 지정 + 목표 색상(컬러 피커 또는 HEX)
- 출력: 해당 의류만 색상이 변경된 이미지
- 핵심 과제: 질감/패턴 보존하면서 색상만 정확히 변경, 경계 자연스러움

### 기능 3: 포즈 변경 (Pose Transfer)
- 설명: 동일 의류/배경을 유지하면서 모델의 자세만 변경
- 입력: 원본 이미지 1장 + 목표 포즈(프리셋 선택 또는 참조 포즈 이미지)
- 출력: 포즈가 변경된 이미지
- 핵심 과제: 의류 형태/디테일 유지, 신체 비율 자연스러움

---

## PRD 작성 요구사항

아래 구조에 맞춰 **한국어로** MVP PRD를 작성해주세요.
각 섹션에 대해 구체적이고 실행 가능한 수준으로 작성합니다.

### 1. Executive Summary
- 한 문단으로 제품 비전, 해결하는 문제, 기대 효과 요약

### 2. 문제 정의 (Problem Statement)
- 현재 쇼핑몰 상세페이지 이미지 제작 과정의 페인포인트
- 정량적 수치 포함 (촬영 비용, 소요 시간, 리소스 등 추정치)
- "~가 없다면" 형식의 부재 시나리오

### 3. 타겟 사용자 & 페르소나
- 주요 페르소나 2-3개 (이름, 역할, 핵심 니즈, 현재 워크플로우)
- 사용자 세그먼트별 우선순위

### 4. MVP 범위 정의
- **In Scope**: MVP에 반드시 포함할 기능 목록 (위 3가지 기능 기반)
- **Out of Scope**: MVP에서 제외하되 향후 고려할 기능
- **MVP 성공 기준**: 출시 후 [기간] 내 달성할 정량 지표

### 5. 기능 상세 스펙

각 기능(의류 교체, 색상 변경, 포즈 변경)에 대해:

#### 5.1 사용자 스토리
- "~로서, ~을 하고 싶다. 왜냐하면 ~이기 때문이다." 형식
- 최소 3개 이상의 사용자 스토리

#### 5.2 기능 요구사항
- 입력/출력 명세
- 처리 흐름 (단계별)
- 제약 조건 (이미지 크기, 포맷, 처리 시간 등)
- 에러 케이스 및 처리 방안

#### 5.3 UI/UX 요구사항
- 화면 구성 개요 (와이어프레임 수준 텍스트 설명)
- 핵심 인터랙션 흐름
- 기존 대시보드 라우트 그룹(`app/(dashboard)/`)에 통합하는 방식

#### 5.4 API 설계
- Gemini API 연동 엔드포인트 설계 (Primary: Nano Banana Pro, Fallback: Nano Banana Flash)
- Response에 `modelUsed`, `fallbackUsed` 필드 포함
- Next.js API Route 구조 (`app/api/`)
- Request/Response 스키마 (TypeScript 인터페이스)
- 에러 핸들링 전략

### 6. 기술 아키텍처

#### 6.1 시스템 구성도
- 클라이언트 → Next.js API Route → Nano Banana Pro (Primary) → Nano Banana Flash (Fallback) 흐름
- 이미지 업로드/저장 전략 (임시 저장 vs 영구 저장)

#### 6.2 Gemini API 연동 설계

**모델 구성 (필수 반영)**

| 구분 | 모델명 | 모델 ID | 특징 |
|------|--------|---------|------|
| **Primary** | Nano Banana Pro (Gemini 3 Pro Image) | `gemini-3-pro-image-preview` | 최고 품질. 4K 지원, 텍스트 렌더링 우수, 구성 이해력 높음 |
| **Fallback** | Nano Banana (Gemini 2.5 Flash Image) | `gemini-2.5-flash-image` | 빠르고 비용 효율적. Primary 과부하/실패 시 자동 전환 |

**Fallback 흐름 (필수 반영)**
1. 모든 요청은 Nano Banana Pro로 먼저 호출
2. HTTP 429 (Rate Limit) / 503 (Service Unavailable) / 500 (Internal Error) 발생 시 → Nano Banana Flash로 자동 전환
3. Flash도 실패 시 → 2초 대기 후 Flash 재시도
4. 최종 실패 시 → 사용자에게 에러 안내
5. Fallback 사용 시 사용자에게 "빠른 모델로 생성되었습니다" toast 표시
6. 모든 결과에 `modelUsed`, `fallbackUsed` 필드를 포함하여 어떤 모델로 생성했는지 추적

- 프롬프트 엔지니어링 전략 (각 기능별 프롬프트 템플릿 초안)
- Rate limiting / 비용 최적화 방안 (모델별 RPM/RPD 분리 모니터링)

#### 6.3 프론트엔드 구조
- 기존 프로젝트 구조에 맞춘 파일/폴더 배치 계획
  - `app/(dashboard)/studio/` — 에디터 메인
  - `components/studio/` — 스튜디오 전용 컴포넌트
  - `lib/gemini.ts` — Gemini API 클라이언트
  - `config/studio.ts` + `types/studio.ts` — Config → Type 패턴 준수
- 상태 관리 전략 (이미지 업로드 상태, 처리 진행률 등)

#### 6.4 데이터 모델
- 이미지 메타데이터 스키마
- 작업 이력(히스토리) 스키마
- 향후 DB 연동 시 마이그레이션 고려사항

### 7. 개발 운영 환경 (DevOps & Hooks)
- Claude Code Hooks 확장 계획
  - 기존 Hook: Slack 알림(세션 시작/권한 요청/완료), 커밋 전 lint+build 검증
  - 스튜디오 기능 추가 시 필요한 Hook (예: Gemini API 키 유효성 검증, 이미지 처리 결과 Slack 알림)
- 환경변수 관리 전략
  - `.env.local` 기반 관리: `SLACK_WEBHOOK_URL`, `GEMINI_API_KEY` 등
  - 민감 정보 노출 방지 정책 (`NEXT_PUBLIC_` 접두사 사용 기준)
- CI/CD 고려사항
  - PreToolUse Hook의 lint+build 검증을 CI 파이프라인과 일관되게 유지

### 8. 비기능 요구사항
- 성능: 이미지 처리 응답 시간 목표
- 보안: API 키 관리, 이미지 데이터 처리 정책
- 확장성: 동시 요청 처리, 큐잉 전략
- 접근성: WCAG 2.1 AA 기준 준수 항목

### 9. 릴리스 계획
- Phase 1 (MVP): 메인 서비스 3가지 (의류 교체, 색상 변경, 포즈 변경). 무인증 사용 가능
- Phase 2 (인증 & 결제): MVP 완성 후 진행
  - 2-A: 소셜 로그인 (카카오 + 구글, NextAuth.js 기반)
  - 2-B: 토큰 결제 (토스 페이먼츠 API)
    - 과금 모델: 이미지 1장당 / 화질별 토큰 차등 소모
    - 토큰 패키지 선불 충전 방식
    - 신규 가입 시 무료 체험 토큰 부여
  - 2-C: Supabase 연동 (DB + Storage + 히스토리 이전)
- Phase 3: 확장 기능 (배치 처리, 구독 플랜, 템플릿 시스템 등)

### 10. 리스크 & 완화 전략
| 리스크 | 영향도 | 발생 가능성 | 완화 전략 |
|--------|--------|------------|----------|
- 기술적 리스크 (Nano Banana Pro 품질, 지연 시간, 과부하 등)
- Fallback 리스크 (Flash 모델 품질 저하, Fallback 빈도 과다)
- 결제 리스크 (토스 API 장애, 토큰 가격 정책 미스매치)
- 인증 리스크 (카카오/구글 OAuth 장애)
- 비즈니스 리스크 (비용, 경쟁 등)
- 운영 리스크 (저작권, 개인정보 등)

### 11. 성공 지표 (KPIs)
- 제품 지표: DAU, 이미지 생성 수, 기능별 사용률
- 품질 지표: 생성 성공률, 사용자 만족도(재사용률)
- 비즈니스 지표: 전환율, 비용 절감률
- Phase 2 지표: 가입 전환율, 유료 전환율, 평균 충전액, 토큰 소진율

---

## 작성 지침

1. **구체적으로**: "좋은 UX를 제공한다" 대신 "이미지 업로드 후 3초 내 프리뷰를 표시한다"
2. **실행 가능하게**: 개발팀이 바로 작업에 착수할 수 있는 수준의 디테일
3. **우선순위 명확히**: MoSCoW (Must/Should/Could/Won't) 기준으로 기능 분류
4. **기존 코드베이스 존중**: 위 기술 스택과 패턴을 그대로 활용하는 방향으로 설계
5. **한국어 UI**: 모든 사용자 대면 텍스트는 한국어, 코드/변수명은 영어
6. **Markdown 형식**: 깔끔한 Markdown으로 작성, 다이어그램은 Mermaid 문법 사용
```

---

## 사용법

1. 위 프롬프트 블록 전체를 복사합니다.
2. `[제품명을 입력하세요]`, `[타겟을 구체화하세요]` 등 대괄호 부분을 실제 값으로 채웁니다.
3. Claude, Gemini, ChatGPT 등 LLM에 입력합니다.
4. 생성된 PRD를 `docs/PRD.md`에 저장합니다.

## 커스터마이징 가이드

| 변경 항목      | 수정 위치                               | 예시                                |
| -------------- | --------------------------------------- | ----------------------------------- |
| 기능 추가/제거 | `핵심 기능 3가지` 섹션                  | 배경 제거 기능 추가                 |
| 기술 스택 변경 | `기술 스택` 섹션                        | Supabase DB 추가                    |
| AI 모델 변경   | `핵심 AI 엔진` + `6.2` 모델 구성 테이블 | 모델 ID 변경, Fallback 모델 교체 등 |
| 타겟 변경      | `타겟 사용자`                           | 패션 브랜드 마케팅팀                |
| 섹션 추가      | `PRD 작성 요구사항` 하위                | 경쟁사 분석, GTM 전략 등            |
