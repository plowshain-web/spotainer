-- center_info 저장 실패 해결용 RLS 정책
-- Supabase SQL Editor에서 그대로 실행하세요.

-- 1) 테이블이 없으면 생성
create table if not exists center_info (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  address text,
  memo text,
  updated_at timestamp default now()
);

-- 2) RLS 활성화
alter table center_info enable row level security;

-- 3) 기존 정책 삭제 후 재생성
drop policy if exists "allow select center_info" on center_info;
drop policy if exists "allow insert center_info" on center_info;
drop policy if exists "allow update center_info" on center_info;
drop policy if exists "allow delete center_info" on center_info;

create policy "allow select center_info"
on center_info
for select
using (true);

create policy "allow insert center_info"
on center_info
for insert
with check (true);

create policy "allow update center_info"
on center_info
for update
using (true)
with check (true);

create policy "allow delete center_info"
on center_info
for delete
using (true);
