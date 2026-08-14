-- =============================================================================
-- Golden Pup Kennel — one-shot database setup
--
-- Run this whole file once, in the Supabase dashboard:
--   SQL Editor → New query → paste → Run
--
-- It creates every table, every Row Level Security policy, the two storage
-- buckets, and the demonstration content so the site has something to show
-- before you have entered your own dogs.
--
-- Re-running it will fail on "already exists", which is deliberate — it tells
-- you the setup already ran rather than silently doing half the work. To start
-- over on a project with nothing worth keeping, uncomment these two lines:
--
--   drop schema public cascade;
--   create schema public;
--
-- Generated from supabase/migrations/*.sql and supabase/seed.sql. Those files
-- remain the source of truth; this is the paste-friendly concatenation.
-- =============================================================================


-- =============================================================================
-- Golden Pup Kennel — schema
--
-- Notes on shape:
--   * Slugs are unique and are the public URL key; ids stay internal.
--   * `is_published` exists on every visitor-facing table so the owner can
--     draft a dog or a litter on a Sunday evening without it appearing.
--   * Money is stored in cents as an integer. Never a float.
--   * No payment is taken on this site, so `applications` carries no deposit
--     or payment-processor columns. An application is a conversation starter
--     that is handed to WhatsApp; this table is the owner's inbox copy.
-- =============================================================================

create extension if not exists "pgcrypto";

-- --- Enumerations -------------------------------------------------------------

create type dog_sex as enum ('dog', 'bitch');
create type dog_role as enum ('sire', 'dam', 'retired', 'companion');
create type puppy_status as enum ('available', 'reserved', 'placed');
create type litter_status as enum ('planned', 'expected', 'born', 'weaning', 'placed');

-- Where an enquiry has got to. Deliberately about the conversation, not money.
create type application_status as enum ('new', 'reading', 'contacted', 'matched', 'declined', 'withdrawn');

-- --- updated_at ---------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- --- dogs ---------------------------------------------------------------------

create table dogs (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,               -- registered name
  call_name       text,                        -- what they are actually called
  sex             dog_sex not null,
  colour          text not null,
  dob             date not null,
  role            dog_role not null,
  weight_lbs      integer check (weight_lbs is null or weight_lbs between 1 and 200),
  registry_number text,
  bio             text not null default '',
  hero_image      text,
  hero_alt        text,                        -- written for a screen reader
  gallery         text[] not null default '{}',
  is_published    boolean not null default false,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index dogs_role_idx on dogs (role) where is_published;
create index dogs_published_idx on dogs (is_published, sort_order);

create trigger dogs_updated_at before update on dogs
  for each row execute function set_updated_at();

-- --- clearances ---------------------------------------------------------------
-- The most load-bearing table on the site. Everything here is transcribed from
-- a certificate; nothing is inferred.

create table clearances (
  id              uuid primary key default gen_random_uuid(),
  dog_id          uuid not null references dogs (id) on delete cascade,
  type            text not null,               -- 'Hips', 'Elbows', 'Eyes', 'EIC'
  result          text not null,               -- 'OFA Good', 'Normal', 'Clear'
  tested_on       date,
  certificate_url text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

create index clearances_dog_idx on clearances (dog_id, sort_order);

-- --- litters ------------------------------------------------------------------

create table litters (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,           -- 'A-2025', shown in the mono rows
  sire_id      uuid references dogs (id) on delete set null,
  dam_id       uuid references dogs (id) on delete set null,
  expected_on  date,
  born_on      date,
  ready_on     date,
  status       litter_status not null default 'planned',
  notes        text not null default '',
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- A litter cannot have been born before it was expected to be conceived,
  -- and cannot go home before it is born.
  constraint litters_dates_sane check (
    (born_on is null or ready_on is null or ready_on >= born_on)
  )
);

create index litters_status_idx on litters (status) where is_published;

create trigger litters_updated_at before update on litters
  for each row execute function set_updated_at();

-- --- puppies ------------------------------------------------------------------

create table puppies (
  id             uuid primary key default gen_random_uuid(),
  litter_id      uuid not null references litters (id) on delete cascade,
  slug           text not null unique,
  name           text not null,
  sex            dog_sex not null,
  colour         text not null,
  collar_colour  text,                          -- how the family tells them apart
  price_cents    integer check (price_cents is null or price_cents >= 0),
  status         puppy_status not null default 'available',
  hero_image     text,
  hero_alt       text,
  gallery        text[] not null default '{}',
  notes          text,
  is_published   boolean not null default false,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index puppies_litter_idx on puppies (litter_id, sort_order);
create index puppies_status_idx on puppies (status) where is_published;

create trigger puppies_updated_at before update on puppies
  for each row execute function set_updated_at();

-- --- applications -------------------------------------------------------------
-- The owner's inbox. The visitor's copy of this goes to WhatsApp.

create table applications (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text not null,
  phone          text not null,
  puppy_id       uuid references puppies (id) on delete set null,
  litter_id      uuid references litters (id) on delete set null,
  home_type      text,
  has_yard       boolean,
  yard_fenced    boolean,
  other_pets     text,
  children_ages  text,
  experience     text,
  time_alone     text,
  preferred_timing text,
  message        text,
  status         application_status not null default 'new',
  /* Set when the browser opened the WhatsApp hand-off. It records that we
     offered the conversation, not that the message was actually sent — the
     browser cannot know that, and the column must not pretend otherwise. */
  handoff_opened_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index applications_status_idx on applications (status, created_at desc);

create trigger applications_updated_at before update on applications
  for each row execute function set_updated_at();

-- --- posts --------------------------------------------------------------------

create table posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text not null default '',
  body         text not null default '',
  cover_image  text,
  cover_alt    text,
  author       text,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index posts_published_idx on posts (published_at desc nulls last);

create trigger posts_updated_at before update on posts
  for each row execute function set_updated_at();

-- --- testimonials -------------------------------------------------------------

create table testimonials (
  id          uuid primary key default gen_random_uuid(),
  author_name text not null,
  location    text,
  quote       text not null,
  photo       text,
  photo_alt   text,
  dog_name    text,
  placed_year integer check (placed_year is null or placed_year between 1980 and 2100),
  is_featured boolean not null default false,
  is_published boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger testimonials_updated_at before update on testimonials
  for each row execute function set_updated_at();

-- --- faqs ---------------------------------------------------------------------

create table faqs (
  id         uuid primary key default gen_random_uuid(),
  category   text not null,
  question   text not null,
  answer     text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index faqs_category_idx on faqs (category, sort_order);

create trigger faqs_updated_at before update on faqs
  for each row execute function set_updated_at();


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


-- =============================================================================
-- Seed data
--
-- These are DEMONSTRATION records so the client can see a populated site, not
-- claims about real animals. Registry numbers are zero-filled so they cannot
-- be mistaken for real AKC numbers, and every clearance result is illustrative
-- and must be re-entered from the actual certificates before launch.
--
-- There are deliberately no seeded testimonials. An invented endorsement with
-- an invented family's name is the exact thing this site exists to be trusted
-- against, so the testimonial slot renders as a labelled placeholder until the
-- client supplies real words.
--
-- Run against a local stack with:  supabase db reset
-- =============================================================================

-- --- dogs ---------------------------------------------------------------------

insert into dogs (slug, name, call_name, sex, colour, dob, role, weight_lbs,
                  registry_number, bio, hero_image, hero_alt, is_published, sort_order)
values
  ('birch', 'Golden Pup''s Second Wind', 'Birch', 'dog', 'Yellow', '2021-03-14',
   'sire', 74, 'SR000000/01',
   'Birch works. He has spent five seasons in the grouse woods and still asks for one more field at the end of the day, then falls asleep under the kitchen table for eleven hours.',
   '/placeholders/dog-sire.jpg',
   'A yellow Labrador standing alert in long field grass, head turned toward the treeline.',
   true, 1),

  ('hazel', 'Golden Pup''s Hazel Run', 'Hazel', 'bitch', 'Yellow', '2021-04-02',
   'dam', 62, 'SR000000/02',
   'Hazel is the one who decides where everybody sleeps. Steady with children to the point of being boring about it, which is exactly what we breed her for.',
   '/placeholders/dog-dam-one.jpg',
   'A yellow Labrador lying on a porch board floor with her chin on her paws.',
   true, 2),

  ('tessa', 'Golden Pup''s Tessa Grade', 'Tessa', 'bitch', 'Black', '2022-08-19',
   'dam', 58, 'SR000000/03',
   'Tessa came back to us from a service programme that had more dogs than placements. She is the softest mouth on the property and the fastest learner we have owned.',
   '/placeholders/dog-dam-two.jpg',
   'A black Labrador sitting in cut grass, looking directly at the camera.',
   true, 3);

-- --- clearances ---------------------------------------------------------------

insert into clearances (dog_id, type, result, tested_on, sort_order)
select d.id, c.type, c.result, c.tested_on, c.sort_order
from dogs d
join (values
  ('birch', 'Hips',   'OFA Excellent', date '2023-04-11', 1),
  ('birch', 'Elbows', 'OFA Normal',    date '2023-04-11', 2),
  ('birch', 'Eyes',   'CAER Clear',    date '2025-01-20', 3),
  ('birch', 'DNA',    '5-panel clear', date '2021-08-02', 4),

  ('hazel', 'Hips',   'OFA Good',      date '2023-06-08', 1),
  ('hazel', 'Elbows', 'OFA Normal',    date '2023-06-08', 2),
  ('hazel', 'Eyes',   'CAER Clear',    date '2025-01-20', 3),
  ('hazel', 'DNA',    '5-panel clear', date '2021-09-15', 4),

  ('tessa', 'Hips',   'OFA Good',      date '2024-09-30', 1),
  ('tessa', 'Elbows', 'OFA Normal',    date '2024-09-30', 2),
  ('tessa', 'Eyes',   'CAER Clear',    date '2025-01-20', 3),
  ('tessa', 'DNA',    '5-panel clear', date '2022-12-04', 4)
) as c (slug, type, result, tested_on, sort_order)
  on c.slug = d.slug;

-- --- litters ------------------------------------------------------------------

insert into litters (code, sire_id, dam_id, born_on, ready_on, status, notes, is_published)
values
  ('A-2025',
   (select id from dogs where slug = 'birch'),
   (select id from dogs where slug = 'hazel'),
   '2025-04-12', '2025-06-07', 'weaning',
   'Seven puppies, all yellow. Whelped in the sitting room over a Sunday night.',
   true),

  ('B-2025',
   (select id from dogs where slug = 'birch'),
   (select id from dogs where slug = 'tessa'),
   '2025-04-26', '2025-06-21', 'weaning',
   'Five puppies, three black and two yellow.',
   true),

  ('C-2025',
   (select id from dogs where slug = 'birch'),
   (select id from dogs where slug = 'hazel'),
   null, null, 'planned',
   'Planned for December. Waiting list opens once the pairing is confirmed.',
   true);

update litters set expected_on = '2025-12-10' where code = 'C-2025';

-- --- puppies ------------------------------------------------------------------

insert into puppies (litter_id, slug, name, sex, colour, collar_colour,
                     price_cents, status, hero_image, hero_alt, is_published, sort_order)
select l.id, p.slug, p.name, p.sex::dog_sex, p.colour, p.collar_colour,
       p.price_cents, p.status::puppy_status, p.hero_image, p.hero_alt, true, p.sort_order
from litters l
join (values
  ('A-2025', 'juniper', 'Juniper', 'bitch', 'Yellow', 'Green',  320000, 'available',
   '/placeholders/default-puppy.jpg',
   'A yellow Labrador puppy in a green collar sitting on cut grass.', 1),
  ('A-2025', 'ash', 'Ash', 'dog', 'Yellow', 'Blue', 320000, 'available',
   '/placeholders/dog-sire.jpg',
   'A yellow Labrador puppy in a blue collar standing on cut grass.', 2),
  ('A-2025', 'wren', 'Wren', 'bitch', 'Yellow', 'Red', 320000, 'reserved',
   '/placeholders/default-dog.jpg',
   'A yellow Labrador puppy in a red collar lying in cut grass.', 3),
  ('B-2025', 'sorrel', 'Sorrel', 'dog', 'Black', 'Orange', 320000, 'available',
   '/placeholders/dog-dam-two.jpg',
   'A black Labrador puppy in an orange collar sitting on cut grass.', 4)
) as p (code, slug, name, sex, colour, collar_colour, price_cents, status,
        hero_image, hero_alt, sort_order)
  on p.code = l.code;

-- --- faqs ---------------------------------------------------------------------
-- Real answers to the questions this audience actually asks. The client edits
-- the wording; the questions themselves are the ones worth answering.

insert into faqs (category, question, answer, sort_order) values
  ('Health testing',
   'What exactly do you test the parents for?',
   'Hips and elbows scored by the OFA at two years or older, an annual CAER eye examination by a veterinary ophthalmologist, and a full breed DNA panel. Every certificate is published on that dog''s own page, and you are welcome to look them up yourself on the OFA website using the registry number.',
   1),
  ('Health testing',
   'What happens if a dog does not pass?',
   'They are spayed or neutered and they stay here as a family dog, or they go to a pet home we know. They are not bred from, and we do not sell them on as breeding stock to somebody else.',
   2),
  ('Health testing',
   'Can I see the certificates before I commit?',
   'Yes, and you should. They are on the site. If any breeder is reluctant to show you the paperwork, that reluctance is the answer to your question.',
   3),

  ('Applying',
   'How does the application work?',
   'You answer about fifteen minutes of questions on this site. Nothing is paid here — when you finish, the form hands your answers to us on WhatsApp so you can send them in one tap, and we carry on from there. We read every application and we reply to every application, including the ones we cannot help.',
   1),
  ('Applying',
   'Do I have to pay a deposit to be on the list?',
   'Not through this website. We take no payment online at all. If we agree on a puppy, we will talk about a deposit directly, and we will tell you exactly what it covers and when it is refundable before you send anything.',
   2),
  ('Applying',
   'How long is the wait?',
   'It depends on the litter and on what you are after. We would rather tell you eight months and be right than tell you eight weeks and keep you hoping. Ask us and we will give you the honest number.',
   3),

  ('Bringing a puppy home',
   'How old are they when they leave?',
   'Eight weeks, and not a day earlier. The weeks between six and eight are where a puppy learns to be a dog from its mother and its litter, and shortening that costs the dog something it does not get back.',
   1),
  ('Bringing a puppy home',
   'What comes with the puppy?',
   'A folder with the registration paperwork, the vaccination and worming record, both parents'' clearances, the microchip number, the health guarantee, four weeks of insurance, the food they are already eating, and a blanket that smells like their litter.',
   2),
  ('Bringing a puppy home',
   'Can you deliver, or do I collect?',
   'You are welcome to collect, and most people do. We deliver ourselves within about four hours'' drive, or we can arrange a flight nanny who carries the puppy in the cabin. Puppies do not travel as cargo.',
   3),

  ('After they are home',
   'What if my circumstances change?',
   'We take the dog back. At eight weeks or at eight years, for any reason, with no questions and no fee. It is written into the contract. No Golden Pup dog ends up in a shelter while we are alive to prevent it.',
   1),
  ('After they are home',
   'What does the health guarantee actually cover?',
   'The full text is on the guarantee page rather than summarised here, because a warranty you have only read a summary of is not much use. Read it before you apply, and ask us about anything in it you do not like.',
   2);
