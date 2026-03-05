-- Generation Log: 모든 AI 생성 요청의 통합 생명주기 추적 테이블
-- 이미지(studio) + 비디오(video) 전체를 하나의 테이블에서 관리

CREATE TABLE generation_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  session_id text NOT NULL,

  -- 요청 정보
  service_type text NOT NULL CHECK (service_type IN ('studio', 'video')),
  action text NOT NULL,
  params jsonb DEFAULT '{}',

  -- 토큰 정보
  tokens_charged integer DEFAULT 0,
  tokens_refunded integer DEFAULT 0,

  -- 생명주기 상태
  status text NOT NULL DEFAULT 'initiated' CHECK (status IN (
    'initiated',
    'processing',
    'tokens_spent',
    'succeed',
    'failed',
    'refunded',
    'abandoned'
  )),

  -- 외부 참조
  external_task_id text,
  reference_id text,

  -- 에러 정보
  error_code text,
  error_message text,

  -- 타임스탬프
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_gen_log_user ON generation_log(user_id, created_at DESC);
CREATE INDEX idx_gen_log_status ON generation_log(status) WHERE status IN ('tokens_spent', 'failed', 'abandoned');
CREATE INDEX idx_gen_log_task ON generation_log(external_task_id) WHERE external_task_id IS NOT NULL;
CREATE INDEX idx_gen_log_session ON generation_log(session_id, created_at DESC);

ALTER TABLE generation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_gen_log ON generation_log FOR SELECT
  USING (auth.uid() = user_id);

-- 토큰 환불 함수
CREATE OR REPLACE FUNCTION refund_tokens(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_reference_id text DEFAULT NULL
)
RETURNS integer AS $$
DECLARE
  v_new_balance integer;
BEGIN
  UPDATE profiles
  SET token_balance = token_balance + p_amount,
      updated_at = now()
  WHERE id = p_user_id
  RETURNING token_balance INTO v_new_balance;

  INSERT INTO token_transactions (user_id, type, amount, balance, description, reference_id)
  VALUES (p_user_id, 'refund', p_amount, v_new_balance, p_description, p_reference_id);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
