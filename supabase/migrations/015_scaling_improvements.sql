-- Scaling improvements: indexes, token reservation

-- generation_log: 관리자 로그 조회 최적화
CREATE INDEX IF NOT EXISTS idx_generation_log_created_at
  ON generation_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generation_log_status
  ON generation_log(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generation_log_service_type
  ON generation_log(service_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generation_log_user_id
  ON generation_log(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- studio_history: 비로그인 세션 체험 카운트 최적화
CREATE INDEX IF NOT EXISTS idx_studio_history_session_trial
  ON studio_history(session_id, user_id)
  WHERE user_id IS NULL;

-- 토큰 예약 함수: 배치 처리 시작 전 전체 비용을 원자적으로 예약
CREATE OR REPLACE FUNCTION reserve_tokens(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_reference_id text DEFAULT NULL
)
RETURNS integer AS $$
DECLARE
  v_current_balance integer;
  v_new_balance integer;
BEGIN
  SELECT token_balance INTO v_current_balance
    FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'TOKEN_INSUFFICIENT: 토큰이 부족합니다. (잔액: %, 필요: %)', v_current_balance, p_amount;
  END IF;

  UPDATE profiles
  SET token_balance = token_balance - p_amount,
      updated_at = now()
  WHERE id = p_user_id
  RETURNING token_balance INTO v_new_balance;

  INSERT INTO token_transactions (user_id, type, amount, balance, description, reference_id)
  VALUES (p_user_id, 'reserve', -p_amount, v_new_balance, p_description, p_reference_id);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 토큰 예약 해제 함수: 미사용 토큰 반환 (배치에서 일부 실패 시)
CREATE OR REPLACE FUNCTION release_reserved_tokens(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_reference_id text DEFAULT NULL
)
RETURNS integer AS $$
DECLARE
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    SELECT token_balance INTO v_new_balance FROM profiles WHERE id = p_user_id;
    RETURN v_new_balance;
  END IF;

  UPDATE profiles
  SET token_balance = token_balance + p_amount,
      updated_at = now()
  WHERE id = p_user_id
  RETURNING token_balance INTO v_new_balance;

  INSERT INTO token_transactions (user_id, type, amount, balance, description, reference_id)
  VALUES (p_user_id, 'release', p_amount, v_new_balance, p_description, p_reference_id);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
