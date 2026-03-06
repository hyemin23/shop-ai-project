-- RLS 보안 수정: 사용자가 자신의 is_master 값을 변경할 수 없도록 제한
-- 기존 update_own_profile 정책은 WITH CHECK 없이 모든 컬럼 수정 허용 (보안 취약점)

DROP POLICY IF EXISTS update_own_profile ON profiles;

CREATE POLICY update_own_profile ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_master IS NOT DISTINCT FROM (SELECT p.is_master FROM profiles p WHERE p.id = auth.uid())
  );
