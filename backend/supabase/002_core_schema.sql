-- ErrandKart Core Schema (run after 001_auth_setup.sql)
create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.supermarket_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete set null,
  business_name varchar not null,
  manager_name varchar not null,
  email varchar not null,
  phone varchar not null,
  address varchar not null,
  city varchar not null default 'Unknown',
  cac_number varchar not null,
  tax_id varchar,
  verification_status varchar not null default 'pending'
    check (verification_status in ('pending','verified','rejected','suspended')),
  dispatch_orders_count int not null default 0,
  active_runners_count int not null default 0,
  cac_certificate_url varchar,
  government_id_url varchar,
  storefront_image_url varchar,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id)
);

create index if not exists idx_supermarket_profiles_user_id on public.supermarket_profiles(user_id);
create index if not exists idx_supermarket_profiles_status on public.supermarket_profiles(verification_status);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.users(id) on delete set null,
  runner_id uuid references public.users(id) on delete set null,
  supermarket_id uuid references public.supermarket_profiles(id) on delete set null,
  dispatch_source varchar not null default 'customer-direct'
    check (dispatch_source in ('customer-direct','supermarket-dispatch')),
  status varchar not null
    check (status in ('pending','accepted','shopping','en_route','arrived','completed','cancelled')),
  title varchar not null,
  description text,
  category varchar,
  pickup_lat numeric(10,7),
  pickup_lng numeric(10,7),
  dropoff_lat numeric(10,7),
  dropoff_lng numeric(10,7),
  pickup_address text,
  dropoff_address text,
  budget_service_fee numeric(12,2) not null default 0.00,
  items_cost numeric(12,2) not null default 0.00,
  proof_of_purchase_url varchar,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_runner_id on public.orders(runner_id);
create index if not exists idx_orders_supermarket_id on public.orders(supermarket_id);
create index if not exists idx_orders_status on public.orders(status);

drop trigger if exists trg_orders_set_updated_at on public.orders;
create trigger trg_orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  requester_user_id uuid not null references public.users(id) on delete cascade,
  requester_role varchar not null check (requester_role in ('customer','runner')),
  channel varchar not null check (channel in ('live-chat','email','phone')),
  category varchar not null,
  summary text not null,
  priority varchar not null check (priority in ('low','medium','high')),
  status varchar not null check (status in ('open','in-progress','resolved','escalated')),
  sla_target varchar,
  last_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_support_tickets_order_id on public.support_tickets(order_id);
create index if not exists idx_support_tickets_requester on public.support_tickets(requester_user_id);
create index if not exists idx_support_tickets_status on public.support_tickets(status);

drop trigger if exists trg_support_tickets_set_updated_at on public.support_tickets;
create trigger trg_support_tickets_set_updated_at
before update on public.support_tickets
for each row execute function public.set_updated_at();

create table if not exists public.order_ratings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_user_id uuid not null references public.users(id) on delete cascade,
  runner_user_id uuid not null references public.users(id) on delete cascade,
  customer_to_runner_rating int check (customer_to_runner_rating between 1 and 5),
  runner_to_customer_rating int check (runner_to_customer_rating between 1 and 5),
  customer_comment text,
  runner_comment text,
  submitted_at timestamptz not null default now()
);

create index if not exists idx_order_ratings_order_id on public.order_ratings(order_id);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12,2) not null,
  type varchar not null check (type in ('deposit','withdrawal','escrow_hold','escrow_release')),
  reference varchar unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_id on public.transactions(user_id);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_order_id on public.chat_messages(order_id);
