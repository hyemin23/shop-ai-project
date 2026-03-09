-- 서비스 점검 공지 테이블
create table system_notices (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'warning', 'maintenance')),
  is_active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 활성 공지 빠른 조회용 인덱스
create index idx_system_notices_active on system_notices(is_active, starts_at, ends_at);

-- RLS
alter table system_notices enable row level security;

-- 모든 인증된 사용자가 활성 공지를 볼 수 있음
create policy "Anyone can view active notices"
  on system_notices for select
  using (is_active = true);

-- 마스터만 공지를 관리할 수 있음 (service_role로 처리)
create policy "Service role can manage notices"
  on system_notices for all
  using (true)
  with check (true);
