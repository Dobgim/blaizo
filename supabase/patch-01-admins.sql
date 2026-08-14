-- =============================================================================
-- Patch 01 — restrict writes to named administrators
--
-- Run this once, in the SQL editor, on a database where setup.sql has ALREADY
-- run. It creates no tables and touches no data.
--
-- Why it is needed: the first version of the policies granted writes to
-- `authenticated`, i.e. to anyone holding an account. Supabase allows public
-- sign-up by default, so a stranger could register and then edit every dog,
-- litter and application. Writing now requires a row in `admins`.
--
-- Safe to re-run: every statement is guarded.
-- =============================================================================

-- --- who is an administrator ---------------------------------------------------

create table if not exists admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  note       text,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

/* SECURITY DEFINER so the check can read `admins` while the caller is being
   evaluated against policies that depend on this very function — without it
   the policy would recurse. search_path is pinned, as it must be for any
   definer function. */
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins a where a.user_id = auth.uid());
$$;

drop policy if exists "admins can see the admin list" on admins;
create policy "admins can see the admin list"
  on admins for select to authenticated
  using (is_admin());

-- --- replace every permissive write policy -------------------------------------

drop policy if exists "signed-in users manage dogs" on dogs;
create policy "signed-in users manage dogs"
  on dogs for all to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "signed-in users manage clearances" on clearances;
create policy "signed-in users manage clearances"
  on clearances for all to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "signed-in users manage litters" on litters;
create policy "signed-in users manage litters"
  on litters for all to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "signed-in users manage puppies" on puppies;
create policy "signed-in users manage puppies"
  on puppies for all to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "signed-in users read applications" on applications;
create policy "signed-in users read applications"
  on applications for select to authenticated
  using (is_admin());

drop policy if exists "signed-in users update applications" on applications;
create policy "signed-in users update applications"
  on applications for update to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "signed-in users delete applications" on applications;
create policy "signed-in users delete applications"
  on applications for delete to authenticated
  using (is_admin());

drop policy if exists "signed-in users manage posts" on posts;
create policy "signed-in users manage posts"
  on posts for all to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "signed-in users manage testimonials" on testimonials;
create policy "signed-in users manage testimonials"
  on testimonials for all to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "signed-in users manage faqs" on faqs;
create policy "signed-in users manage faqs"
  on faqs for all to authenticated
  using (is_admin()) with check (is_admin());

-- --- storage --------------------------------------------------------------------
-- Otherwise a stranger with an account could fill the kennel's buckets.

drop policy if exists "signed-in users write kennel media" on storage.objects;
create policy "signed-in users write kennel media"
  on storage.objects for insert to authenticated
  with check (is_admin() and bucket_id in ('photos', 'certificates'));

drop policy if exists "signed-in users replace kennel media" on storage.objects;
create policy "signed-in users replace kennel media"
  on storage.objects for update to authenticated
  using (is_admin() and bucket_id in ('photos', 'certificates'));

drop policy if exists "signed-in users delete kennel media" on storage.objects;
create policy "signed-in users delete kennel media"
  on storage.objects for delete to authenticated
  using (is_admin() and bucket_id in ('photos', 'certificates'));

-- --- grant the owner admin rights ------------------------------------------------
-- Matched by email so it works whichever account was created. If this inserts
-- nothing, the account does not exist yet: create it under Authentication →
-- Users, then run this block again.

insert into admins (user_id, email, note)
select id, email, 'Kennel owner'
from auth.users
where email = 'dobgimajoshua52@gmail.com'
on conflict (user_id) do nothing;

-- --- confirm ----------------------------------------------------------------------

select
  (select count(*) from admins) as administrators,
  (select count(*) from pg_policies
    where schemaname = 'public' and qual = 'true' and cmd <> 'INSERT')
    as permissive_policies_remaining;
