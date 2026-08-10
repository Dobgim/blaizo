-- =============================================================================
-- Row Level Security
--
-- The rule everywhere: the public (anon) role reads published rows and nothing
-- else. Authenticated users — which means the kennel owner, signed in at
-- /admin — read and write everything.
--
-- The single exception is `applications`: anyone may INSERT one, nobody
-- anonymous may ever read one back. A visitor's home address, their children's
-- ages and their phone number are in that table.
-- =============================================================================

alter table dogs         enable row level security;
alter table clearances   enable row level security;
alter table litters      enable row level security;
alter table puppies      enable row level security;
alter table applications enable row level security;
alter table posts        enable row level security;
alter table testimonials enable row level security;
alter table faqs         enable row level security;

-- --- dogs ---------------------------------------------------------------------

create policy "dogs are publicly readable when published"
  on dogs for select to anon, authenticated
  using (is_published);

create policy "signed-in users manage dogs"
  on dogs for all to authenticated
  using (true) with check (true);

-- --- clearances ---------------------------------------------------------------
-- Visible exactly when the dog they belong to is visible.

create policy "clearances follow their dog"
  on clearances for select to anon, authenticated
  using (exists (
    select 1 from dogs d where d.id = clearances.dog_id and d.is_published
  ));

create policy "signed-in users manage clearances"
  on clearances for all to authenticated
  using (true) with check (true);

-- --- litters ------------------------------------------------------------------

create policy "litters are publicly readable when published"
  on litters for select to anon, authenticated
  using (is_published);

create policy "signed-in users manage litters"
  on litters for all to authenticated
  using (true) with check (true);

-- --- puppies ------------------------------------------------------------------
-- A puppy needs its own publish flag AND a published litter. Unpublishing a
-- litter takes its puppies with it, which is the behaviour the owner expects.

create policy "puppies are publicly readable when published"
  on puppies for select to anon, authenticated
  using (is_published and exists (
    select 1 from litters l where l.id = puppies.litter_id and l.is_published
  ));

create policy "signed-in users manage puppies"
  on puppies for all to authenticated
  using (true) with check (true);

-- --- applications -------------------------------------------------------------

create policy "anyone may submit an application"
  on applications for insert to anon, authenticated
  with check (true);

-- Deliberately no SELECT policy for anon. Without one, RLS denies by default.
create policy "signed-in users read applications"
  on applications for select to authenticated
  using (true);

create policy "signed-in users update applications"
  on applications for update to authenticated
  using (true) with check (true);

create policy "signed-in users delete applications"
  on applications for delete to authenticated
  using (true);

-- --- posts --------------------------------------------------------------------
-- Published means the date has actually arrived, so scheduling works.

create policy "posts are publicly readable once published"
  on posts for select to anon, authenticated
  using (published_at is not null and published_at <= now());

create policy "signed-in users manage posts"
  on posts for all to authenticated
  using (true) with check (true);

-- --- testimonials -------------------------------------------------------------

create policy "testimonials are publicly readable when published"
  on testimonials for select to anon, authenticated
  using (is_published);

create policy "signed-in users manage testimonials"
  on testimonials for all to authenticated
  using (true) with check (true);

-- --- faqs ---------------------------------------------------------------------

create policy "faqs are publicly readable when published"
  on faqs for select to anon, authenticated
  using (is_published);

create policy "signed-in users manage faqs"
  on faqs for all to authenticated
  using (true) with check (true);

-- =============================================================================
-- Storage
--
-- Two buckets. Photography is public because it is the point of the site.
-- Certificates are public too — a breeder who hides the paperwork is the
-- problem this site exists to distinguish itself from — but writes are locked
-- to the owner in both.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true), ('certificates', 'certificates', true)
on conflict (id) do nothing;

create policy "public may read kennel media"
  on storage.objects for select to anon, authenticated
  using (bucket_id in ('photos', 'certificates'));

create policy "signed-in users write kennel media"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('photos', 'certificates'));

create policy "signed-in users replace kennel media"
  on storage.objects for update to authenticated
  using (bucket_id in ('photos', 'certificates'));

create policy "signed-in users delete kennel media"
  on storage.objects for delete to authenticated
  using (bucket_id in ('photos', 'certificates'));
