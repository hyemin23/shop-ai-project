# Next.js App Router Dev — Agent Memory

## Route Structure

### (dashboard) routes — all under app/(dashboard)/dashboard/

- `/dashboard` — DashboardPage: 스튜디오 허브 (3개 feature 카드). DO NOT MODIFY.
- `/dashboard/studio` — StudioTryOnPage: 의류 교체 (Virtual Try-On)
- `/dashboard/studio/color-swap` — StudioColorSwapPage: 색상 변경
- `/dashboard/studio/pose-transfer` — StudioPoseTransferPage: 포즈 변경
- `/dashboard/history` — HistoryPage: 작업 히스토리
- `/dashboard/settings` — SettingsPage: 설정

### API Routes (stubs, all return 501) — app/api/

- POST /api/studio/try-on
- POST /api/studio/color-swap
- POST /api/studio/pose-transfer
- POST /api/upload

## Skeleton Placeholder Pattern (Phase 1 pages)

Pages use `import { Skeleton } from "@/components/ui/skeleton"` for placeholder UI.
Structure: `<div className="space-y-6"> <div> <h1> + <p> </div> + skeleton grid </div>`

## Build Notes

- All dashboard studio pages render as Static (○) — no dynamic data yet.
- API routes render as Dynamic (ƒ) — POST handlers with NextResponse.

## Key Files

- `config/dashboard.ts` — sidebar nav config (update when adding new routes to sidebar)
- `app/(dashboard)/layout.tsx` — wraps all dashboard pages with SidebarProvider + AppSidebar + DashboardHeader
- `app/(dashboard)/dashboard/page.tsx` — hub page, DO NOT MODIFY
