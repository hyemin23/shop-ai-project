-- handle_new_user() 트리거 함수 보강: Google/Kakao OAuth 호환
-- Kakao OAuth의 raw_user_meta_data 필드명이 Google과 다를 수 있어 COALESCE로 fallback 처리
-- 기존 트리거(on_auth_user_created)는 유지되므로 함수만 교체하면 됨

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, avatar_url)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
