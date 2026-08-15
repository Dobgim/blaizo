-- =============================================================================
-- Patch 04 — orders
--
-- Run once, in the SQL editor.
--
-- The site now takes orders. It does NOT take payments: Zelle, Cash App, Chime
-- and Apple Cash are all manual transfers the buyer makes from their own app,
-- so no card number, account number or token ever reaches this database. What
-- is stored is the order itself and which method the buyer said they would
-- use.
--
-- `paid` is therefore a claim, not a fact. Nothing can confirm it except the
-- owner seeing the money arrive, so it defaults to false and only an admin can
-- change it. The column is named to make that obvious.
-- =============================================================================

create type order_status as enum (
  'placed',      -- buyer submitted, no money seen yet
  'paid',        -- owner has confirmed the transfer landed
  'preparing',   -- paid and being got ready to travel
  'completed',   -- puppy is home
  'cancelled',
  'refunded'
);

create type payment_method as enum ('zelle', 'cashapp', 'chime', 'applepay');

create table orders (
  id             uuid primary key default gen_random_uuid(),

  /* Human-readable and short enough to quote over the phone or type into a
     Cash App note. Generated in the app, unique so it can be searched. */
  reference      text not null unique,

  buyer_name     text not null,
  buyer_email    text not null,
  buyer_phone    text not null,

  puppy_id       uuid references puppies (id) on delete set null,
  /* Copied, not joined. If the puppy is later deleted or renamed the receipt
     must still say what was actually bought. */
  puppy_name     text not null,
  puppy_slug     text,

  /* Full price in cents. There is no deposit option: the kennel takes payment
     in full or not at all. */
  amount_cents   integer not null check (amount_cents >= 0),
  payment_method payment_method not null,

  status         order_status not null default 'placed',
  /* Set by the owner in the admin panel when the transfer actually arrives. */
  paid_confirmed_at timestamptz,
  notes          text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index orders_status_idx on orders (status, created_at desc);
create index orders_reference_idx on orders (reference);

create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- --- Row Level Security --------------------------------------------------------
-- Same shape as applications: anyone may place one, nobody anonymous may read
-- one back. An order row carries a buyer's name, email and phone number.

alter table orders enable row level security;

create policy "anyone may place an order"
  on orders for insert to anon, authenticated
  with check (true);

-- Deliberately no SELECT for anon. Without a policy, RLS denies by default.
create policy "admins read orders"
  on orders for select to authenticated
  using (is_admin());

create policy "admins update orders"
  on orders for update to authenticated
  using (is_admin()) with check (is_admin());

create policy "admins delete orders"
  on orders for delete to authenticated
  using (is_admin());

-- --- confirm ---------------------------------------------------------------------

select 'orders table' as check, count(*)::text as value from orders
union all
select 'policies on orders', count(*)::text from pg_policies
  where schemaname = 'public' and tablename = 'orders';
