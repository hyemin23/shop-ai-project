-- Studio History: 이미지 생성 작업 기록
-- Phase 1에서 실제 사용되는 핵심 테이블

CREATE TABLE studio_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  type text NOT NULL CHECK (type IN ('try-on', 'color-swap', 'pose-transfer')),
  mode text NOT NULL CHECK (mode IN ('standard', 'premium')),
  source_image_url text NOT NULL,
  result_image_url text NOT NULL,
  source_thumb_url text,
  result_thumb_url text,
  params jsonb NOT NULL,
  model_used text NOT NULL,
  fallback_used boolean DEFAULT false,
  processing_time integer
);

CREATE INDEX idx_studio_history_session ON studio_history(session_id, created_at DESC);
CREATE INDEX idx_studio_history_user ON studio_history(user_id, created_at DESC);

ALTER TABLE studio_history ENABLE ROW LEVEL SECURITY;

-- session_id 기반 조회 정책 (비로그인 사용자)
CREATE POLICY select_own_session_history ON studio_history FOR SELECT
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id');

-- API Route가 service_role로 INSERT
CREATE POLICY insert_history ON studio_history FOR INSERT
  WITH CHECK (true);
