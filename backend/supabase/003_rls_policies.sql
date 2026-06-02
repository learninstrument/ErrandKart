-- ErrandKart RLS Policies
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  );
$$;

create or replace function public.is_runner()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'runner'
  );
$$;

create or replace function public.is_customer()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'customer'
  );
$$;

create or replace function public.is_supermarket()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'supermarket'
  );
$$;

alter table public.users enable row level security;
alter table public.runner_profiles enable row level security;
alter table public.supermarket_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.support_tickets enable row level security;
alter table public.order_ratings enable row level security;
alter table public.transactions enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "users_admin_all" on public.users;
create policy "users_admin_all"
on public.users
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "runner_profiles_admin_all" on public.runner_profiles;
create policy "runner_profiles_admin_all"
on public.runner_profiles
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "supermarket_profiles_select_own" on public.supermarket_profiles;
create policy "supermarket_profiles_select_own"
on public.supermarket_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "supermarket_profiles_select_admin" on public.supermarket_profiles;
create policy "supermarket_profiles_select_admin"
on public.supermarket_profiles
for select
using (public.is_admin());

drop policy if exists "supermarket_profiles_insert" on public.supermarket_profiles;
create policy "supermarket_profiles_insert"
on public.supermarket_profiles
for insert
with check (public.is_supermarket());

drop policy if exists "supermarket_profiles_update_own" on public.supermarket_profiles;
create policy "supermarket_profiles_update_own"
on public.supermarket_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "supermarket_profiles_update_admin" on public.supermarket_profiles;
create policy "supermarket_profiles_update_admin"
on public.supermarket_profiles
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "orders_select_customer" on public.orders;
create policy "orders_select_customer"
on public.orders
for select
using (customer_id = auth.uid());

drop policy if exists "orders_select_runner" on public.orders;
create policy "orders_select_runner"
on public.orders
for select
using (runner_id = auth.uid());

drop policy if exists "orders_select_supermarket" on public.orders;
create policy "orders_select_supermarket"
on public.orders
for select
using (
  exists (
    select 1 from public.supermarket_profiles sp
    where sp.id = orders.supermarket_id
      and sp.user_id = auth.uid()
  )
);

drop policy if exists "orders_select_admin" on public.orders;
create policy "orders_select_admin"
on public.orders
for select
using (public.is_admin());

drop policy if exists "orders_insert_customer" on public.orders;
create policy "orders_insert_customer"
on public.orders
for insert
with check (public.is_customer() and customer_id = auth.uid());

drop policy if exists "orders_update_participants" on public.orders;
create policy "orders_update_participants"
on public.orders
for update
using (
  customer_id = auth.uid()
  or runner_id = auth.uid()
  or exists (
    select 1 from public.supermarket_profiles sp
    where sp.id = orders.supermarket_id
      and sp.user_id = auth.uid()
  )
)
with check (
  customer_id = auth.uid()
  or runner_id = auth.uid()
  or exists (
    select 1 from public.supermarket_profiles sp
    where sp.id = orders.supermarket_id
      and sp.user_id = auth.uid()
  )
);

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
on public.orders
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "support_tickets_select_own" on public.support_tickets;
create policy "support_tickets_select_own"
on public.support_tickets
for select
using (requester_user_id = auth.uid());

drop policy if exists "support_tickets_select_admin" on public.support_tickets;
create policy "support_tickets_select_admin"
on public.support_tickets
for select
using (public.is_admin());

drop policy if exists "support_tickets_insert_own" on public.support_tickets;
create policy "support_tickets_insert_own"
on public.support_tickets
for insert
with check (requester_user_id = auth.uid());

drop policy if exists "support_tickets_update_admin" on public.support_tickets;
create policy "support_tickets_update_admin"
on public.support_tickets
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "order_ratings_select_participants" on public.order_ratings;
create policy "order_ratings_select_participants"
on public.order_ratings
for select
using (customer_user_id = auth.uid() or runner_user_id = auth.uid());

drop policy if exists "order_ratings_select_admin" on public.order_ratings;
create policy "order_ratings_select_admin"
on public.order_ratings
for select
using (public.is_admin());

drop policy if exists "order_ratings_insert_participants" on public.order_ratings;
create policy "order_ratings_insert_participants"
on public.order_ratings
for insert
with check (customer_user_id = auth.uid() or runner_user_id = auth.uid());

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
on public.transactions
for select
using (user_id = auth.uid());

drop policy if exists "transactions_select_admin" on public.transactions;
create policy "transactions_select_admin"
on public.transactions
for select
using (public.is_admin());

drop policy if exists "chat_messages_select_participants" on public.chat_messages;
create policy "chat_messages_select_participants"
on public.chat_messages
for select
using (
  sender_id = auth.uid()
  or receiver_id = auth.uid()
  or exists (
    select 1 from public.orders o
    where o.id = chat_messages.order_id
      and (o.customer_id = auth.uid() or o.runner_id = auth.uid())
  )
);

drop policy if exists "chat_messages_insert_sender" on public.chat_messages;
create policy "chat_messages_insert_sender"
on public.chat_messages
for insert
with check (sender_id = auth.uid());
