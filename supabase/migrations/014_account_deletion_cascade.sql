-- 회원 탈퇴 시 관련 데이터 자동 삭제를 위한 CASCADE 설정
-- studio_history, batch_jobs는 auth.users 직접 참조 (CASCADE 없음)
-- generation_log는 profiles(id) 참조 (CASCADE 없음)

-- studio_history: ON DELETE SET NULL (히스토리 보존, 유저 연결만 해제)
ALTER TABLE studio_history DROP CONSTRAINT IF EXISTS studio_history_user_id_fkey;
ALTER TABLE studio_history ADD CONSTRAINT studio_history_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- batch_jobs: ON DELETE SET NULL
ALTER TABLE batch_jobs DROP CONSTRAINT IF EXISTS batch_jobs_user_id_fkey;
ALTER TABLE batch_jobs ADD CONSTRAINT batch_jobs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- generation_log: ON DELETE SET NULL
ALTER TABLE generation_log DROP CONSTRAINT IF EXISTS generation_log_user_id_fkey;
ALTER TABLE generation_log ADD CONSTRAINT generation_log_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- subscriptions: 활성 구독 자동 취소 처리를 위한 CASCADE
-- (subscriptions 테이블이 존재하는 경우에만)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    EXECUTE 'ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey';
    EXECUTE 'ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE';
  END IF;
END $$;
