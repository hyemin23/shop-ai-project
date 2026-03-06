-- 약관 동의 기록 테이블
CREATE TABLE consent_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  consent_type text NOT NULL CHECK (consent_type IN ('terms', 'privacy', 'marketing')),
  agreed boolean NOT NULL DEFAULT true,
  version text NOT NULL DEFAULT '2026-03-06',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_consent_records_user ON consent_records(user_id, consent_type);

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_consent ON consent_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY insert_own_consent ON consent_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- profiles에 동의 상태 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_agreed_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_agreed boolean DEFAULT false NOT NULL;

COMMENT ON TABLE consent_records IS '약관/개인정보/마케팅 동의 이력 (법적 증빙용)';
COMMENT ON COLUMN profiles.terms_agreed_at IS '이용약관+개인정보처리방침 동의 일시 (NULL이면 미동의)';
COMMENT ON COLUMN profiles.marketing_agreed IS '마케팅 수신 동의 여부';

-- 기존 유저는 가입 시점에 동의한 것으로 간주
UPDATE profiles SET terms_agreed_at = created_at WHERE terms_agreed_at IS NULL;
