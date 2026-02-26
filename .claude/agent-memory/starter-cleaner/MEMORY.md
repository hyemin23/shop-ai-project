# Starter Cleaner Agent Memory

## 프로젝트: 똑픽 (DDokPick)

초기화 완료 (2026-02-27). 스타터킷 → 똑픽 프로젝트 기반으로 전환.

## 제거된 파일 목록

- `components/showcase/` — 스타터킷 컴포넌트 쇼케이스 전체 (7파일)
- `app/(marketing)/components/page.tsx` — 쇼케이스 라우트
- `home.png`, `login.png`, `register.png`, `dashboard.png` — 스크린샷 데모 이미지

## 업데이트된 파일

- `config/site.ts` — 똑픽 서비스 정보, 네비게이션(기능/가격/스튜디오), 푸터로 교체
- `config/dashboard.ts` — 스튜디오 사이드바 메뉴 (의류교체/색상변경/포즈변경/히스토리/설정)
- `components/marketing/hero-section.tsx` — 똑픽 서비스 소개 헤로 섹션
- `components/marketing/features-section.tsx` — 3가지 핵심 기능 + 부가 기능 카드 6개
- `app/(dashboard)/dashboard/page.tsx` — 더미 stats 제거, 스튜디오 3기능 진입 카드로 교체
- `app/layout.tsx` — 메타데이터 "똑픽 (DDokPick)"으로 업데이트
- `app/(auth)/login/page.tsx` — console.log 제거, Phase 2 주석 추가
- `app/(auth)/register/page.tsx` — console.log 제거, Phase 2 주석 추가
- `.env` — Supabase/Gemini 키 주석으로 추가
- `README.md` — PRD 기반 완전 재작성
- `CLAUDE.md` — 프로젝트 한 줄 설명 + PRD 참조 링크 추가, showcase 참조 제거
- `.env.example` — 신규 생성 (모든 환경변수 키 목록)

## 현재 라우트 구조

- `/` — 랜딩 (HeroSection + FeaturesSection)
- `/dashboard` — 스튜디오 랜딩 (3기능 진입 카드)
- `/login` — 로그인 폼 (Phase 2 Supabase Auth 예정)
- `/register` — 회원가입 폼 (Phase 2 Supabase Auth 예정)

## Phase 1에서 추가 예정 경로

- `app/(dashboard)/dashboard/studio/` — 의류 교체 스튜디오
- `app/(dashboard)/dashboard/studio/color-swap/` — 색상 변경
- `app/(dashboard)/dashboard/studio/pose-transfer/` — 포즈 변경
- `app/(dashboard)/dashboard/history/` — 작업 히스토리
- `app/api/studio/` — Gemini API 연동 API Routes
- `components/studio/` — 스튜디오 컴포넌트
- `lib/gemini.ts`, `lib/supabase/` — 외부 API 클라이언트
- `config/studio.ts` — 포즈 프리셋, 색상 팔레트
- `types/studio.ts` — 스튜디오 요청/응답 타입
- `supabase/migrations/` — DB 마이그레이션

## 주의사항

- `config/dashboard.ts`의 href가 `/dashboard/studio` 등으로 설정됨 — 아직 라우트 미생성 상태
- auth 페이지 onSubmit은 파라미터 없는 빈 함수로 처리 (React Hook Form이 허용)
- ESLint: 0 errors, 0 warnings. Build: 5 static pages 성공.
