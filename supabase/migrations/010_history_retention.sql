-- pg_cron 확장 활성화 (Supabase Pro 플랜에서 사용 가능)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 30일 초과 히스토리 정리 함수
CREATE OR REPLACE FUNCTION cleanup_old_history()
RETURNS void AS $$
BEGIN
  -- studio_history: 30일 초과 삭제
  DELETE FROM studio_history
  WHERE created_at < now() - interval '30 days';

  -- generation_log: 30일 초과 + 최종 상태만 삭제
  -- tokens_spent/abandoned는 관리자 확인 필요하므로 보존
  DELETE FROM generation_log
  WHERE created_at < now() - interval '30 days'
    AND status IN ('initiated', 'processing', 'succeed', 'failed', 'refunded');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 매일 자정(UTC) 실행
SELECT cron.schedule(
  'cleanup-old-history',
  '0 0 * * *',
  'SELECT cleanup_old_history()'
);
