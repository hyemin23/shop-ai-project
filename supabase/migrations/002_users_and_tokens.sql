-- Profiles & Token Transactions: 사용자 프로필 및 토큰 거래 내역
-- Phase 4 대비 선제 정의

CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  display_name text,
  avatar_url text,
  free_tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_profile ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY update_own_profile ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 신규 사용자 가입 시 자동 프로필 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE token_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('charge', 'spend', 'refund', 'bonus')),
  amount integer NOT NULL,
  balance integer NOT NULL,
  description text NOT NULL,
  reference_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_token_transactions_user ON token_transactions(user_id, created_at DESC);

ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_transactions ON token_transactions FOR SELECT
  USING (auth.uid() = user_id);
