-- 마스터 계정 지원: profiles 테이블에 is_master 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_master boolean DEFAULT false NOT NULL;

COMMENT ON COLUMN profiles.is_master IS '마스터 계정 여부 — 결제 없이 직접 토큰 충전 가능';
