-- ErrandKart Errands and Saved Locations Schema (Run in Supabase SQL editor)

-- 1. Create saved_locations table
create table if not exists public.saved_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  label varchar not null,
  address text not null,
  lat numeric(10,7),
  lng numeric(10,7),
  created_at timestamptz not null default now(),
  constraint unique_user_label unique (user_id, label)
);

create index if not exists idx_saved_locations_user_id on public.saved_locations(user_id);

-- 2. Create errands table
create table if not exists public.errands (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.users(id) on delete set null,
  runner_id uuid references public.users(id) on delete set null,
  title varchar not null,
  description text,
  category varchar,
  fulfillment_mode varchar not null default 'direct-runner'
    check (fulfillment_mode in ('direct-runner','supermarket-dispatch')),
  pickup_address text,
  dropoff_address text,
  budget_customer_fee numeric(12,2) not null default 0.00,
  budget_service_fee numeric(12,2) not null default 0.00,
  supermarket_name varchar,
  supermarket_order_ref varchar,
  supermarket_contact varchar,
  requires_cooler boolean not null default false,
  pickup_lat numeric(10,7),
  pickup_lng numeric(10,7),
  dropoff_lat numeric(10,7),
  dropoff_lng numeric(10,7),
  runner_lat numeric(10,7),
  runner_lng numeric(10,7),
  status varchar not null default 'pending'
    check (status in ('pending','active','shopping','en_route','arrived','completed','cancelled')),
  proof_of_purchase_url varchar,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_errands_customer_id on public.errands(customer_id);
create index if not exists idx_errands_runner_id on public.errands(runner_id);
create index if not exists idx_errands_status on public.errands(status);

-- Trigger function for updated_at on errands table
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_errands_set_updated_at on public.errands;
create trigger trg_errands_set_updated_at
before update on public.errands
for each row execute function public.set_updated_at();

-- 3. Enable Row Level Security (RLS)
alter table public.saved_locations enable row level security;
alter table public.errands enable row level security;

-- 4. RLS Policies for saved_locations
drop policy if exists "saved_locations_select_own" on public.saved_locations;
create policy "saved_locations_select_own" on public.saved_locations
for select using (auth.uid() = user_id);

drop policy if exists "saved_locations_insert_own" on public.saved_locations;
create policy "saved_locations_insert_own" on public.saved_locations
for insert with check (auth.uid() = user_id);

drop policy if exists "saved_locations_delete_own" on public.saved_locations;
create policy "saved_locations_delete_own" on public.saved_locations
for delete using (auth.uid() = user_id);

-- 5. RLS Policies for errands
drop policy if exists "errands_select_customer" on public.errands;
create policy "errands_select_customer" on public.errands
for select using (customer_id = auth.uid());

drop policy if exists "errands_select_runner" on public.errands;
create policy "errands_select_runner" on public.errands
for select using ((public.is_runner() and status = 'pending') or runner_id = auth.uid());

drop policy if exists "errands_select_admin" on public.errands;
create policy "errands_select_admin" on public.errands
for select using (public.is_admin());

drop policy if exists "errands_insert_customer" on public.errands;
create policy "errands_insert_customer" on public.errands
for insert with check (public.is_customer() and customer_id = auth.uid());

drop policy if exists "errands_update_participants" on public.errands;
create policy "errands_update_participants" on public.errands
for update using (
  customer_id = auth.uid()
  or runner_id = auth.uid()
)
with check (
  customer_id = auth.uid()
  or runner_id = auth.uid()
);

drop policy if exists "errands_update_admin" on public.errands;
create policy "errands_update_admin" on public.errands
for update using (public.is_admin()) with check (public.is_admin());
