-- CRIT-03: 무제한 INSERT 정책 제거
-- studio_history, batch_jobs는 service_role(API route)에서만 삽입하므로
-- RLS INSERT 정책이 불필요 (service_role은 RLS bypass)
DROP POLICY IF EXISTS insert_history ON studio_history;
DROP POLICY IF EXISTS insert_batch_jobs ON batch_jobs;
