-- ErrandKart Storage Buckets + Policies
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('kyc_documents', 'kyc_documents', false),
  ('receipts', 'receipts', false),
  ('supermarket_documents', 'supermarket_documents', false)
on conflict (id) do nothing;

alter table storage.objects enable row level security;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects
for select
using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write"
on storage.objects
for insert
with check (bucket_id = 'avatars' and auth.uid() = owner);

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
on storage.objects
for update
using (bucket_id = 'avatars' and auth.uid() = owner)
with check (bucket_id = 'avatars' and auth.uid() = owner);

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
on storage.objects
for delete
using (bucket_id = 'avatars' and auth.uid() = owner);

drop policy if exists "kyc_documents_owner_read" on storage.objects;
create policy "kyc_documents_owner_read"
on storage.objects
for select
using (bucket_id = 'kyc_documents' and (auth.uid() = owner or public.is_admin()));

drop policy if exists "kyc_documents_owner_write" on storage.objects;
create policy "kyc_documents_owner_write"
on storage.objects
for insert
with check (bucket_id = 'kyc_documents' and auth.uid() = owner);

drop policy if exists "receipts_participant_read" on storage.objects;
create policy "receipts_participant_read"
on storage.objects
for select
using (
  bucket_id = 'receipts'
  and (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = split_part(name, '/', 1)::uuid
        and (o.customer_id = auth.uid() or o.runner_id = auth.uid())
    )
  )
);

drop policy if exists "receipts_participant_write" on storage.objects;
create policy "receipts_participant_write"
on storage.objects
for insert
with check (
  bucket_id = 'receipts'
  and exists (
    select 1 from public.orders o
    where o.id = split_part(name, '/', 1)::uuid
      and (o.customer_id = auth.uid() or o.runner_id = auth.uid())
  )
);

drop policy if exists "supermarket_documents_owner_read" on storage.objects;
create policy "supermarket_documents_owner_read"
on storage.objects
for select
using (
  bucket_id = 'supermarket_documents'
  and (
    public.is_admin()
    or exists (
      select 1 from public.supermarket_profiles sp
      where sp.id = split_part(name, '/', 1)::uuid
        and sp.user_id = auth.uid()
    )
  )
);

drop policy if exists "supermarket_documents_owner_write" on storage.objects;
create policy "supermarket_documents_owner_write"
on storage.objects
for insert
with check (
  bucket_id = 'supermarket_documents'
  and exists (
    select 1 from public.supermarket_profiles sp
    where sp.id = split_part(name, '/', 1)::uuid
      and sp.user_id = auth.uid()
  )
);
