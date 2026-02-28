-- Batch Jobs: 다중 이미지 배치 처리 테이블
-- Task 020: 배치 처리 기능

CREATE TABLE batch_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  type text NOT NULL CHECK (type IN ('try-on', 'color-swap', 'pose-transfer')),
  mode text NOT NULL CHECK (mode IN ('standard', 'premium')),
  total_items integer NOT NULL,
  completed_items integer NOT NULL DEFAULT 0,
  failed_items integer NOT NULL DEFAULT 0,
  params jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- studio_history에 batch_id 컬럼 추가
ALTER TABLE studio_history ADD COLUMN batch_id uuid REFERENCES batch_jobs(id);

CREATE INDEX idx_batch_jobs_user ON batch_jobs(user_id, created_at DESC);
CREATE INDEX idx_batch_jobs_session ON batch_jobs(session_id, created_at DESC);
CREATE INDEX idx_studio_history_batch ON studio_history(batch_id) WHERE batch_id IS NOT NULL;

ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY insert_batch_jobs ON batch_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY select_own_batch_jobs ON batch_jobs FOR SELECT
  USING (user_id = auth.uid() OR session_id = current_setting('request.headers', true)::json->>'x-session-id');
CREATE POLICY update_batch_jobs ON batch_jobs FOR UPDATE WITH CHECK (true);
