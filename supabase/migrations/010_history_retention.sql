-- 30일 초과 히스토리 정리 함수
-- Vercel Cron (/api/cron/cleanup)에서 매일 호출
CREATE OR REPLACE FUNCTION cleanup_old_history()
RETURNS json AS $$
DECLARE
  history_count int;
  log_count int := 0;
BEGIN
  -- studio_history: 30일 초과 삭제
  DELETE FROM studio_history
  WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS history_count = ROW_COUNT;

  -- generation_log: 30일 초과 + 최종 상태만 삭제 (테이블 존재 시에만)
  -- tokens_spent/abandoned는 관리자 확인 필요하므로 보존
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'generation_log') THEN
    DELETE FROM generation_log
    WHERE created_at < now() - interval '30 days'
      AND status IN ('initiated', 'processing', 'succeed', 'failed', 'refunded');
    GET DIAGNOSTICS log_count = ROW_COUNT;
  END IF;

  RETURN json_build_object(
    'history_deleted', history_count,
    'log_deleted', log_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
