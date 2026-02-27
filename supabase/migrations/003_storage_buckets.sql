-- Storage Buckets: 스튜디오 이미지 저장소
-- source/, result/, thumb/ 경로로 이미지 관리

INSERT INTO storage.buckets (id, name, public)
VALUES ('studio-images', 'studio-images', true);

-- 공개 읽기 정책
CREATE POLICY public_read_studio_images ON storage.objects FOR SELECT
  USING (bucket_id = 'studio-images');

-- service_role만 쓰기 (API Route에서 사용)
CREATE POLICY service_write_studio_images ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'studio-images');
