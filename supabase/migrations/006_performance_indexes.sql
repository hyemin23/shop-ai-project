-- Performance indexes for production optimization

-- studio_history: 활성 배치 조회 최적화
CREATE INDEX IF NOT EXISTS idx_studio_history_user_type
  ON studio_history(user_id, type, created_at DESC)
  WHERE user_id IS NOT NULL;

-- batch_jobs: 진행 중인 배치만 조회
CREATE INDEX IF NOT EXISTS idx_batch_jobs_active
  ON batch_jobs(user_id, status)
  WHERE status IN ('pending', 'processing');

-- profiles: 토큰 잔액 조회 (자주 사용)
CREATE INDEX IF NOT EXISTS idx_profiles_token_balance
  ON profiles(id)
  WHERE token_balance > 0;
