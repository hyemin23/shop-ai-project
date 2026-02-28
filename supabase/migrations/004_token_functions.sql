-- Token Functions: token_balance 컬럼 + RPC 함수
-- Phase 4: 토큰 잔액 관리 (원자적 업데이트)

-- profiles에 token_balance 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS token_balance integer DEFAULT 0;

-- 토큰 잔액 조회 함수
CREATE OR REPLACE FUNCTION token_balance(p_user_id uuid)
RETURNS integer AS $$
  SELECT COALESCE(token_balance, 0) FROM profiles WHERE id = p_user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 토큰 충전 함수 (결제 후 호출)
CREATE OR REPLACE FUNCTION charge_tokens(
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
  VALUES (p_user_id, 'charge', p_amount, v_new_balance, p_description, p_reference_id);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 토큰 차감 함수 (이미지 생성 시 호출)
CREATE OR REPLACE FUNCTION spend_tokens(
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
  SELECT token_balance INTO v_current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'TOKEN_INSUFFICIENT: 토큰이 부족합니다. (잔액: %, 필요: %)', v_current_balance, p_amount;
  END IF;

  UPDATE profiles
  SET token_balance = token_balance - p_amount,
      updated_at = now()
  WHERE id = p_user_id
  RETURNING token_balance INTO v_new_balance;

  INSERT INTO token_transactions (user_id, type, amount, balance, description, reference_id)
  VALUES (p_user_id, 'spend', -p_amount, v_new_balance, p_description, p_reference_id);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 세션→유저 연결 함수 (로그인 시 비로그인 기록을 유저에게 연결)
CREATE OR REPLACE FUNCTION link_session_to_user(
  p_session_id text,
  p_user_id uuid
)
RETURNS integer AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE studio_history
  SET user_id = p_user_id
  WHERE session_id = p_session_id AND user_id IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 보너스 토큰 지급 함수 (가입 보너스, 이벤트 등)
CREATE OR REPLACE FUNCTION grant_bonus_tokens(
  p_user_id uuid,
  p_amount integer,
  p_description text
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

  INSERT INTO token_transactions (user_id, type, amount, balance, description)
  VALUES (p_user_id, 'bonus', p_amount, v_new_balance, p_description);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
