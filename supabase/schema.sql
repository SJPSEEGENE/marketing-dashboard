create extension if not exists "pgcrypto";

create table if not exists public.marketing_tools (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  test_name text,
  category text not null check (category in ('학술임상', '영업제안', '마케팅지원', 'IT솔루션', '검사홍보', '기타')),
  keywords text[] default '{}',
  description text,
  file_url text not null,
  file_name text not null,
  file_path text,
  file_type text not null check (file_type in ('pdf', 'image')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_marketing_tools_updated_at on public.marketing_tools;
create trigger set_marketing_tools_updated_at
before update on public.marketing_tools
for each row execute function public.set_updated_at();

alter table public.marketing_tools enable row level security;

-- 일반 사용자 조회 허용
create policy "Public read marketing tools"
on public.marketing_tools
for select
using (true);

-- 이 앱은 자체 고정 관리자 로그인 방식이므로 anon key로 CRUD를 허용합니다.
-- 실제 사내 운영 시에는 Supabase Auth 또는 서버 API Route로 보강 권장.
create policy "Public insert marketing tools"
on public.marketing_tools
for insert
with check (true);

create policy "Public update marketing tools"
on public.marketing_tools
for update
using (true)
with check (true);

create policy "Public delete marketing tools"
on public.marketing_tools
for delete
using (true);

create index if not exists marketing_tools_category_idx on public.marketing_tools(category);
create index if not exists marketing_tools_created_at_idx on public.marketing_tools(created_at desc);
