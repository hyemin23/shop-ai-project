-- 베타 테스터 지원: 개인 Gemini API 키로 이미지 생성
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_beta boolean DEFAULT false NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gemini_api_key text;

COMMENT ON COLUMN profiles.is_beta IS '베타 테스터 여부 — 개인 Gemini API 키 사용, 비디오 기능 접근 불가';
COMMENT ON COLUMN profiles.gemini_api_key IS '베타 유저 전용 개인 Gemini API 키 (암호화 권장)';

-- RLS: 사용자가 자신의 is_beta, gemini_api_key를 직접 변경할 수 없도록 update 정책 수정
DROP POLICY IF EXISTS update_own_profile ON profiles;
CREATE POLICY update_own_profile ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_master IS NOT DISTINCT FROM (SELECT p.is_master FROM profiles p WHERE p.id = auth.uid())
    AND is_beta IS NOT DISTINCT FROM (SELECT p.is_beta FROM profiles p WHERE p.id = auth.uid())
    AND gemini_api_key IS NOT DISTINCT FROM (SELECT p.gemini_api_key FROM profiles p WHERE p.id = auth.uid())
  );
