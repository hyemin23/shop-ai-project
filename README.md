# 똑픽 (DDokPick)

동대문 의류 셀러를 위한 AI 이미지 편집 B2B SaaS.
Google Gemini API를 활용해 **의류 교체, 색상 변경, 포즈 변경** 3가지 핵심 기능을 제공합니다.

> 1벌당 5~15만 원의 촬영 비용을 **건당 1,000원 이하, 수 분 이내**로 단축합니다.

## 프로젝트 개요

| 항목         | 내용                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| **서비스명** | 똑픽 (DDokPick)                                                             |
| **목적**     | 동대문 사입 기반 중소 의류 셀러의 촬영 비용 절감 및 상품 이미지 제작 효율화 |
| **타겟**     | 스마트스토어/에이블리 운영 셀러, 상세페이지 디자이너                        |
| **상태**     | Phase 1 MVP 개발 중                                                         |

## 핵심 기능

| 기능                           | 설명                                             | 상태    |
| ------------------------------ | ------------------------------------------------ | ------- |
| **의류 교체 (Virtual Try-On)** | Base 이미지 + Reference 의류 이미지 → 자동 합성  | Phase 1 |
| **색상 변경 (Color Swap)**     | 의류 색상을 컬러피커 또는 12가지 프리셋으로 변경 | Phase 1 |
| **포즈 변경 (Pose Transfer)**  | 10가지 포즈 프리셋 또는 참조 이미지로 포즈 변환  | Phase 1 |
| 소셜 로그인 (카카오/구글)      | Supabase Auth OAuth 연동                         | Phase 2 |
| 토큰 결제 시스템               | 토스 페이먼츠 연동, 선불 토큰 충전               | Phase 2 |

## 기술 스택

| 카테고리            | 기술                                                                   |
| ------------------- | ---------------------------------------------------------------------- |
| **프레임워크**      | Next.js 16 (App Router)                                                |
| **언어**            | TypeScript (Strict Mode)                                               |
| **UI**              | shadcn/ui, Radix UI, Lucide Icons                                      |
| **스타일링**        | Tailwind CSS 4, CSS Variables (OKLCH)                                  |
| **폼**              | React Hook Form + Zod                                                  |
| **테마**            | next-themes (다크모드 지원)                                            |
| **DB/Storage/Auth** | Supabase (PostgreSQL + Storage + Auth)                                 |
| **AI**              | Google Gemini API (gemini-2.5-flash-image, gemini-3-pro-image-preview) |

## 프로젝트 구조

```
app/
├── (marketing)/         # 마케팅 페이지 (SiteHeader + SiteFooter)
│   └── page.tsx         # 랜딩 페이지
├── (auth)/              # 인증 페이지 (중앙 정렬, 네비게이션 없음)
│   ├── login/           # 로그인 (Phase 2: Supabase Auth)
│   └── register/        # 회원가입 (Phase 2: Supabase Auth)
├── (dashboard)/         # 스튜디오 영역 (AppSidebar 레이아웃)
│   └── dashboard/       # 스튜디오 랜딩 (3가지 기능 진입점)
├── layout.tsx           # 루트 레이아웃 (ThemeProvider, Toaster)
└── globals.css

components/
├── ui/                  # shadcn/ui 컴포넌트
├── marketing/           # site-header, site-footer, hero, features
├── dashboard/           # app-sidebar, dashboard-header
└── providers/           # ThemeProvider

config/
├── site.ts              # 서비스 정보, 네비게이션, 푸터 설정
└── dashboard.ts         # 스튜디오 사이드바 메뉴 설정

types/
└── index.ts             # SiteConfig, NavItem, DashboardConfig 등

# Phase 1에서 추가 예정
app/api/studio/          # Gemini API 연동 API Routes
components/studio/       # 스튜디오 전용 컴포넌트
lib/gemini.ts            # Gemini API 클라이언트
lib/supabase/            # Supabase 클라이언트 (browser/server)
config/studio.ts         # 포즈 프리셋, 색상 팔레트 설정
types/studio.ts          # 스튜디오 요청/응답 타입
supabase/migrations/     # DB 마이그레이션
```

## 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 Supabase, Gemini API 키 입력

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 스크립트

| 명령어          | 설명               |
| --------------- | ------------------ |
| `npm run dev`   | 개발 서버 실행     |
| `npm run build` | 프로덕션 빌드      |
| `npm run lint`  | ESLint 실행        |
| `npm start`     | 프로덕션 서버 실행 |

## 환경변수

| 변수명                          | 용도                             | 필요 시점 |
| ------------------------------- | -------------------------------- | --------- |
| `SLACK_WEBHOOK_URL`             | Claude Code Hooks Slack 알림     | 선택사항  |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase 프로젝트 URL            | Phase 1   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 (RLS 보호)      | Phase 1   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase 서버 전용 키 (RLS 우회) | Phase 1   |
| `GEMINI_API_KEY`                | Google Gemini API 키 (서버 전용) | Phase 1   |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY`   | 토스 페이먼츠 클라이언트 키      | Phase 2   |
| `TOSS_SECRET_KEY`               | 토스 페이먼츠 서버 키            | Phase 2   |

## 개발 로드맵

| Phase                   | 내용                                                | 기간 |
| ----------------------- | --------------------------------------------------- | ---- |
| **Phase 1 — MVP**       | Supabase 인프라 세팅 + 스튜디오 3가지 기능 구현     | 4주  |
| **Phase 2 — 인증/결제** | Supabase Auth 소셜 로그인 + 토스 페이먼츠 토큰 결제 | 4주  |
| **Phase 3 — 확장**      | 배치 처리, 상세페이지 템플릿, 팀 협업               | 6주  |

## 문서

- [PRD 문서](./docs/PRD.md) — 상세 요구사항 및 기술 스펙
- [개발 가이드](./CLAUDE.md) — Claude Code 개발 지침
