-- ============================================================
-- Baseline Migration: 전체 스키마 (2026-03-09 기준)
-- 기존 001~015 마이그레이션을 하나로 squash
-- ============================================================

-- ==================== 1. TABLES ====================

-- profiles: 사용자 프로필 (auth.users 확장)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  display_name text,
  avatar_url text,
  token_balance integer DEFAULT 0,
  free_tokens_used integer DEFAULT 0,
  is_master boolean DEFAULT false NOT NULL,
  is_beta boolean DEFAULT false NOT NULL,
  gemini_api_key text,
  terms_agreed_at timestamptz,
  marketing_agreed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- token_transactions: 토큰 거래 내역
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('charge', 'spend', 'refund', 'bonus', 'reserve', 'release')),
  amount integer NOT NULL,
  balance integer NOT NULL,
  description text NOT NULL,
  reference_id text,
  created_at timestamptz DEFAULT now()
);

-- studio_history: 이미지 생성 작업 기록
CREATE TABLE IF NOT EXISTS studio_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  type text NOT NULL CHECK (type IN (
    'try-on', 'color-swap', 'pose-transfer', 'background-swap',
    'auto-fitting', 'detail-extract', 'multi-pose', 'product-info', 'ugc'
  )),
  mode text NOT NULL CHECK (mode IN ('standard', 'premium')),
  source_image_url text NOT NULL,
  result_image_url text NOT NULL,
  source_thumb_url text,
  result_thumb_url text,
  params jsonb NOT NULL,
  model_used text NOT NULL,
  fallback_used boolean DEFAULT false,
  processing_time integer,
  batch_id uuid
);

-- batch_jobs: 다중 이미지 배치 처리
CREATE TABLE IF NOT EXISTS batch_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  type text NOT NULL CHECK (type IN (
    'try-on', 'color-swap', 'pose-transfer', 'background-swap',
    'auto-fitting', 'detail-extract', 'multi-pose', 'product-info', 'ugc'
  )),
  mode text NOT NULL CHECK (mode IN ('standard', 'premium')),
  total_items integer NOT NULL,
  completed_items integer NOT NULL DEFAULT 0,
  failed_items integer NOT NULL DEFAULT 0,
  params jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- studio_history.batch_id FK (batch_jobs 생성 후)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'studio_history_batch_id_fkey'
  ) THEN
    ALTER TABLE studio_history ADD CONSTRAINT studio_history_batch_id_fkey
      FOREIGN KEY (batch_id) REFERENCES batch_jobs(id);
  END IF;
END $$;

-- generation_log: AI 생성 요청 통합 생명주기 추적
CREATE TABLE IF NOT EXISTS generation_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('studio', 'video')),
  action text NOT NULL,
  params jsonb DEFAULT '{}',
  tokens_charged integer DEFAULT 0,
  tokens_refunded integer DEFAULT 0,
  status text NOT NULL DEFAULT 'initiated' CHECK (status IN (
    'initiated', 'processing', 'tokens_spent', 'succeed', 'failed', 'refunded', 'abandoned'
  )),
  external_task_id text,
  reference_id text,
  error_code text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- consent_records: 약관 동의 기록
CREATE TABLE IF NOT EXISTS consent_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  consent_type text NOT NULL CHECK (consent_type IN ('terms', 'privacy', 'marketing')),
  agreed boolean NOT NULL DEFAULT true,
  version text NOT NULL DEFAULT '2026-03-06',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- subscriptions: 구독 관리
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id text NOT NULL,
  billing_key text,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  payment_failed_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==================== 2. INDEXES ====================

-- studio_history
CREATE INDEX IF NOT EXISTS idx_studio_history_session ON studio_history(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_history_user ON studio_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_history_batch ON studio_history(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_studio_history_user_type ON studio_history(user_id, type, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_studio_history_session_trial ON studio_history(session_id, user_id) WHERE user_id IS NULL;

-- batch_jobs
CREATE INDEX IF NOT EXISTS idx_batch_jobs_user ON batch_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_session ON batch_jobs(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_active ON batch_jobs(user_id, status) WHERE status IN ('pending', 'processing');

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_token_balance ON profiles(id) WHERE token_balance > 0;

-- token_transactions
CREATE INDEX IF NOT EXISTS idx_token_transactions_user ON token_transactions(user_id, created_at DESC);

-- generation_log
CREATE INDEX IF NOT EXISTS idx_gen_log_user ON generation_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gen_log_status ON generation_log(status) WHERE status IN ('tokens_spent', 'failed', 'abandoned');
CREATE INDEX IF NOT EXISTS idx_gen_log_task ON generation_log(external_task_id) WHERE external_task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gen_log_session ON generation_log(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_log_created_at ON generation_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_log_status ON generation_log(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_log_service_type ON generation_log(service_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_log_user_id ON generation_log(user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- consent_records
CREATE INDEX IF NOT EXISTS idx_consent_records_user ON consent_records(user_id, consent_type);

-- ==================== 3. STORAGE ====================

INSERT INTO storage.buckets (id, name, public)
VALUES ('studio-images', 'studio-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS public_read_studio_images ON storage.objects FOR SELECT
  USING (bucket_id = 'studio-images');

CREATE POLICY IF NOT EXISTS service_write_studio_images ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'studio-images');

-- ==================== 4. RLS ====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- profiles
DO $$ BEGIN
  DROP POLICY IF EXISTS select_own_profile ON profiles;
  CREATE POLICY select_own_profile ON profiles FOR SELECT USING (auth.uid() = id);

  DROP POLICY IF EXISTS update_own_profile ON profiles;
  CREATE POLICY update_own_profile ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
      auth.uid() = id
      AND is_master IS NOT DISTINCT FROM (SELECT p.is_master FROM profiles p WHERE p.id = auth.uid())
      AND is_beta IS NOT DISTINCT FROM (SELECT p.is_beta FROM profiles p WHERE p.id = auth.uid())
      AND gemini_api_key IS NOT DISTINCT FROM (SELECT p.gemini_api_key FROM profiles p WHERE p.id = auth.uid())
    );
END $$;

-- token_transactions
DROP POLICY IF EXISTS select_own_transactions ON token_transactions;
CREATE POLICY select_own_transactions ON token_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- studio_history
DROP POLICY IF EXISTS select_own_session_history ON studio_history;
CREATE POLICY select_own_session_history ON studio_history FOR SELECT
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id');

DROP POLICY IF EXISTS insert_history ON studio_history;
CREATE POLICY insert_history ON studio_history FOR INSERT WITH CHECK (true);

-- batch_jobs
DROP POLICY IF EXISTS insert_batch_jobs ON batch_jobs;
CREATE POLICY insert_batch_jobs ON batch_jobs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS select_own_batch_jobs ON batch_jobs;
CREATE POLICY select_own_batch_jobs ON batch_jobs FOR SELECT
  USING (user_id = auth.uid() OR session_id = current_setting('request.headers', true)::json->>'x-session-id');

DROP POLICY IF EXISTS update_batch_jobs ON batch_jobs;
CREATE POLICY update_batch_jobs ON batch_jobs FOR UPDATE WITH CHECK (true);

-- generation_log
DROP POLICY IF EXISTS select_own_gen_log ON generation_log;
CREATE POLICY select_own_gen_log ON generation_log FOR SELECT
  USING (auth.uid() = user_id);

-- consent_records
DROP POLICY IF EXISTS select_own_consent ON consent_records;
CREATE POLICY select_own_consent ON consent_records FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS insert_own_consent ON consent_records;
CREATE POLICY insert_own_consent ON consent_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  USING (true) WITH CHECK (true);

-- ==================== 5. FUNCTIONS ====================

-- handle_new_user: OAuth 호환 (Google/Kakao)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'user_name'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 트리거 (존재하지 않을 때만)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- token_balance: 잔액 조회
CREATE OR REPLACE FUNCTION token_balance(p_user_id uuid)
RETURNS integer AS $$
  SELECT COALESCE(token_balance, 0) FROM profiles WHERE id = p_user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- charge_tokens: 토큰 충전
CREATE OR REPLACE FUNCTION charge_tokens(
  p_user_id uuid, p_amount integer, p_description text, p_reference_id text DEFAULT NULL
) RETURNS integer AS $$
DECLARE v_new_balance integer;
BEGIN
  UPDATE profiles SET token_balance = token_balance + p_amount, updated_at = now()
  WHERE id = p_user_id RETURNING token_balance INTO v_new_balance;
  INSERT INTO token_transactions (user_id, type, amount, balance, description, reference_id)
  VALUES (p_user_id, 'charge', p_amount, v_new_balance, p_description, p_reference_id);
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- spend_tokens: 토큰 차감
CREATE OR REPLACE FUNCTION spend_tokens(
  p_user_id uuid, p_amount integer, p_description text, p_reference_id text DEFAULT NULL
) RETURNS integer AS $$
DECLARE v_current_balance integer; v_new_balance integer;
BEGIN
  SELECT token_balance INTO v_current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'TOKEN_INSUFFICIENT: 토큰이 부족합니다. (잔액: %, 필요: %)', v_current_balance, p_amount;
  END IF;
  UPDATE profiles SET token_balance = token_balance - p_amount, updated_at = now()
  WHERE id = p_user_id RETURNING token_balance INTO v_new_balance;
  INSERT INTO token_transactions (user_id, type, amount, balance, description, reference_id)
  VALUES (p_user_id, 'spend', -p_amount, v_new_balance, p_description, p_reference_id);
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- refund_tokens: 토큰 환불
CREATE OR REPLACE FUNCTION refund_tokens(
  p_user_id uuid, p_amount integer, p_description text, p_reference_id text DEFAULT NULL
) RETURNS integer AS $$
DECLARE v_new_balance integer;
BEGIN
  UPDATE profiles SET token_balance = token_balance + p_amount, updated_at = now()
  WHERE id = p_user_id RETURNING token_balance INTO v_new_balance;
  INSERT INTO token_transactions (user_id, type, amount, balance, description, reference_id)
  VALUES (p_user_id, 'refund', p_amount, v_new_balance, p_description, p_reference_id);
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- reserve_tokens: 토큰 예약 (배치 처리)
CREATE OR REPLACE FUNCTION reserve_tokens(
  p_user_id uuid, p_amount integer, p_description text, p_reference_id text DEFAULT NULL
) RETURNS integer AS $$
DECLARE v_current_balance integer; v_new_balance integer;
BEGIN
  SELECT token_balance INTO v_current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'TOKEN_INSUFFICIENT: 토큰이 부족합니다. (잔액: %, 필요: %)', v_current_balance, p_amount;
  END IF;
  UPDATE profiles SET token_balance = token_balance - p_amount, updated_at = now()
  WHERE id = p_user_id RETURNING token_balance INTO v_new_balance;
  INSERT INTO token_transactions (user_id, type, amount, balance, description, reference_id)
  VALUES (p_user_id, 'reserve', -p_amount, v_new_balance, p_description, p_reference_id);
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- release_reserved_tokens: 미사용 토큰 반환
CREATE OR REPLACE FUNCTION release_reserved_tokens(
  p_user_id uuid, p_amount integer, p_description text, p_reference_id text DEFAULT NULL
) RETURNS integer AS $$
DECLARE v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    SELECT token_balance INTO v_new_balance FROM profiles WHERE id = p_user_id;
    RETURN v_new_balance;
  END IF;
  UPDATE profiles SET token_balance = token_balance + p_amount, updated_at = now()
  WHERE id = p_user_id RETURNING token_balance INTO v_new_balance;
  INSERT INTO token_transactions (user_id, type, amount, balance, description, reference_id)
  VALUES (p_user_id, 'release', p_amount, v_new_balance, p_description, p_reference_id);
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- link_session_to_user: 세션→유저 연결
CREATE OR REPLACE FUNCTION link_session_to_user(p_session_id text, p_user_id uuid)
RETURNS integer AS $$
DECLARE v_updated integer;
BEGIN
  UPDATE studio_history SET user_id = p_user_id
  WHERE session_id = p_session_id AND user_id IS NULL;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- grant_bonus_tokens: 보너스 토큰 지급
CREATE OR REPLACE FUNCTION grant_bonus_tokens(p_user_id uuid, p_amount integer, p_description text)
RETURNS integer AS $$
DECLARE v_new_balance integer;
BEGIN
  UPDATE profiles SET token_balance = token_balance + p_amount, updated_at = now()
  WHERE id = p_user_id RETURNING token_balance INTO v_new_balance;
  INSERT INTO token_transactions (user_id, type, amount, balance, description)
  VALUES (p_user_id, 'bonus', p_amount, v_new_balance, p_description);
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- cleanup_old_history: 30일 초과 히스토리 정리
CREATE OR REPLACE FUNCTION cleanup_old_history()
RETURNS json AS $$
DECLARE history_count int; log_count int := 0;
BEGIN
  DELETE FROM studio_history WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS history_count = ROW_COUNT;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'generation_log') THEN
    DELETE FROM generation_log
    WHERE created_at < now() - interval '30 days'
      AND status IN ('initiated', 'processing', 'succeed', 'failed', 'refunded');
    GET DIAGNOSTICS log_count = ROW_COUNT;
  END IF;
  RETURN json_build_object('history_deleted', history_count, 'log_deleted', log_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- subscriptions updated_at 트리거
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_subscriptions_updated_at_trigger
      BEFORE UPDATE ON subscriptions
      FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();
  END IF;
END $$;
