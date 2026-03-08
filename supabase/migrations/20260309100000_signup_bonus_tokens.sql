-- 회원가입 시 무료 3 토큰 증정
-- handle_new_user 트리거 함수 업데이트

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_signup_bonus CONSTANT integer := 3;
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url, token_balance)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'user_name'
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    v_signup_bonus
  );

  -- 토큰 트랜잭션 기록
  INSERT INTO public.token_transactions (user_id, type, amount, balance, description)
  VALUES (NEW.id, 'charge', v_signup_bonus, v_signup_bonus, '회원가입 축하 무료 토큰');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
