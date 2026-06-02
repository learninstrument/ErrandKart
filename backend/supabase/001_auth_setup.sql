-- ErrandKart Auth Bootstrap (run in Supabase SQL editor)
-- Safe for first-time setup.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role varchar not null default 'customer' check (role in ('customer', 'runner', 'supermarket', 'admin')),
  full_name varchar,
  email varchar unique,
  phone_number varchar,
  avatar_url varchar,
  wallet_balance numeric(12,2) not null default 0.00,
  account_status varchar not null default 'active' check (account_status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.runner_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  kyc_document_url varchar,
  is_verified boolean not null default false,
  vehicle_type varchar,
  bank_account_number varchar,
  bank_code varchar,
  rating numeric(3,2) not null default 0.00,
  total_trips int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_set_updated_at on public.users;
create trigger trg_users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_runner_profiles_set_updated_at on public.runner_profiles;
create trigger trg_runner_profiles_set_updated_at
before update on public.runner_profiles
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.runner_profiles enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
on public.users
for select
using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "runner_profiles_select_own" on public.runner_profiles;
create policy "runner_profiles_select_own"
on public.runner_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "runner_profiles_update_own" on public.runner_profiles;
create policy "runner_profiles_update_own"
on public.runner_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

