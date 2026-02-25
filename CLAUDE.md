# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — 개발 서버 실행
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint 실행
- `npm start` — 프로덕션 서버 실행

테스트 프레임워크는 아직 미설정. shadcn 컴포넌트 추가 시 `npx shadcn@latest add <component>`.

## Architecture

Next.js 16 App Router 기반 풀스택 스타터킷. React 19, TypeScript strict mode.

### Route Groups

- `app/(marketing)/` — 마케팅 페이지 (SiteHeader + SiteFooter 레이아웃)
- `app/(auth)/` — 로그인/회원가입 (중앙 정렬 레이아웃, 네비게이션 없음)
- `app/(dashboard)/` — 대시보드 (SidebarProvider + AppSidebar 레이아웃)

각 route group은 자체 `layout.tsx`를 가지며, root layout(`app/layout.tsx`)에서 ThemeProvider, TooltipProvider, Toaster를 전역 제공.

### Component Organization

- `components/ui/` — shadcn/ui 컴포넌트 (Radix UI + Tailwind CSS + CVA variants). `components.json`으로 관리.
- `components/marketing/` — site-header, site-footer, hero-section, features-section
- `components/dashboard/` — app-sidebar, dashboard-header
- `components/providers/` — ThemeProvider (next-themes)
- `components/showcase/` — 컴포넌트 쇼케이스 페이지 전용

### Config → Type → Component 패턴

사이트 설정은 `config/site.ts`(네비게이션, 푸터), `config/dashboard.ts`(사이드바 메뉴)에 정의. `types/index.ts`에서 `SiteConfig`, `NavItem`, `DashboardConfig` 등 인터페이스 export. 헤더/푸터/사이드바가 이 config를 매핑해 자동 렌더링.

### Form Pattern

React Hook Form + Zod + shadcn Form 컴포넌트 조합. `zodResolver`로 스키마 검증, `toast`(sonner)로 피드백 표시. auth 페이지와 쇼케이스에서 이 패턴 사용.

### Styling

Tailwind CSS 4 + CSS 변수(OKLCH 색공간). 클래스 병합은 `lib/utils.ts`의 `cn()` 함수(clsx + tailwind-merge). 다크모드는 next-themes의 class 전략.

### Claude Code Hooks

`.claude/settings.local.json`에 정의된 Hook 시스템으로 Slack 알림과 커밋 전 검증을 수행.

- **SessionStart** — `.env.local`에서 `SLACK_WEBHOOK_URL`을 `CLAUDE_ENV_FILE`로 로드
- **Notification** (`permission_prompt`) — 권한 요청 시 Slack 알림 전송 (`:lock:` 아이콘)
- **Stop** — 작업 완료 시 Slack 알림 전송 (`:white_check_mark:` 아이콘)
- **PreToolUse** (`Bash`) — `git commit` 감지 시 `npm run lint` + `npm run build` 검증, 실패 시 커밋 차단

Slack 알림 스크립트: `.claude/hooks/notify-slack.sh`. 채널 `#starter-kit-noti`로 전송. `SLACK_WEBHOOK_URL` 미설정 시 조용히 무시.

## Conventions

- 언어: HTML lang="ko", 모든 UI 텍스트 한국어. 코드(변수명, 컴포넌트명)는 영어.
- 경로 별칭: `@/*` → 프로젝트 루트
- 인증: 현재 플레이스홀더(폼만 존재). 실제 auth 서비스 미연동.
- API/DB: 미설정 상태. API routes 없음.
- 환경변수: `.env.local`에 `SLACK_WEBHOOK_URL` 설정 필요 (Slack 알림용). 형식: `https://hooks.slack.com/services/...`
