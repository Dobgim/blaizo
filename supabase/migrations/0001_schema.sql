-- =============================================================================
-- Ridgeline Retrievers — schema
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
