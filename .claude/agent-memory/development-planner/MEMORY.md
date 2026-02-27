# Development Planner Agent Memory

## Project: DDokPick (똑픽)

- B2B SaaS for 동대문 clothing sellers - AI image editing via Gemini API
- PRD: `/docs/PRD.md` (v1.2, 2026-02-27)
- Roadmap: `/docs/ROADMAP.md` (21 Tasks, 4 Phases)

## Current State (2026-02-27)

- Phase 1 COMPLETED (Task 001~004 all done, scores: 95/95/93/93)
- Phase 2 next: Task 005 (common components) is the priority
- Phase 1 deliverables: types/studio.ts, types/payment.ts, lib/errors.ts, config/studio.ts, config/pricing.ts, config/prompts.ts, 5 studio pages, 4 API route stubs, 3 SQL migrations, docs/SCHEMA.md
- Still missing: lib/supabase/, lib/gemini.ts, components/studio/\*.tsx, hooks/
- No /tasks directory yet - task reference files (001-studio-types.md etc.) referenced in ROADMAP but not yet created

## Key Architecture Decisions

- Config -> Type -> Component pattern (existing pattern in project)
- Session-based access for MVP (no auth required), user_id added in Phase 4
- Gemini dual mode: Flash (standard) + Pro (premium) with auto-fallback
- Supabase: DB + Storage + Auth (Auth in Phase 4)
- Token billing via Toss Payments (Phase 4)

## Task Dependencies (Critical Path)

- Task 001 (types) -> Task 002 (config) -> Task 005 (components) -> Task 006-009 (UI)
- Task 004 (DB schema) -> Task 011 (Supabase) -> Task 013/014 (API)
- Task 014 (API) -> Task 015 (UI-API connect) -> Task 016 (error handling)
- Task 015 -> Task 017 (auth) -> Task 018 (payments) -> Task 019 (token UI)

## File Organization

- Studio types: `types/studio.ts`, `types/payment.ts`
- Studio config: `config/studio.ts`, `config/pricing.ts`, `config/prompts.ts`
- Studio components: `components/studio/*.tsx`
- Supabase: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`
- API routes: `app/api/studio/*/route.ts`, `app/api/upload/route.ts`
- DB migrations: `supabase/migrations/*.sql`

## Conventions

- Task naming: `Task XXX: [동사] + [대상] + [목적]` (Korean)
- Phase status: completed phases get checkmark suffix
- Task status: completed -> prefix with checkmark + "See: /tasks/XXX-xxx.md"
- No /tasks directory yet - create when first task is completed
