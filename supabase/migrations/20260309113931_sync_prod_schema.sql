-- Prod에만 존재하던 스키마를 Dev에 동기화

-- 1) profiles.subscription_plan_id 컬럼 추가
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_plan_id text;

-- 2) subscriptions.status CHECK 제약 추가
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_status_check
  CHECK (status = ANY (ARRAY['active'::text, 'past_due'::text, 'canceled'::text, 'paused'::text]));
