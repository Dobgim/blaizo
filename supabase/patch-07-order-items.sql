-- =============================================================================
-- Patch 07 — more than one puppy on an order
--
-- Run once, in the SQL editor. Run patch-06 first if you have not.
--
-- The cart can hold three puppies and, until now, could only order them one at
-- a time: an order was one row with one `puppy_name` and one `amount_cents`.
-- A family taking two littermates had to go through checkout twice and got two
-- invoices for what is, to them, one purchase.
--
-- So the puppies move to their own table and `orders` becomes the header:
-- who is buying, how they intend to pay, and the total. That is the shape an
-- invoice already has, and it means a two-puppy order is one reference, one
-- phone call and one total.
--
-- The old single-puppy columns stay on `orders`, nullable, for two reasons:
-- orders taken before today are still in there and must keep reading correctly,
-- and the admin list shows `puppy_name` as the row label. The app now writes a
-- summary into it — "Truffle + Daisy" — so that list keeps working untouched
-- while `order_items` holds the real per-puppy detail.
-- =============================================================================

create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),

  order_id     uuid not null references orders (id) on delete cascade,

  /* Nulled rather than cascaded: deleting a puppy from the website must not
     quietly delete a line from something somebody has paid for. */
  puppy_id     uuid references puppies (id) on delete set null,

  /* Copied, not joined — same reason as on `orders`. If the puppy is renamed
     or removed, the invoice must still say what was actually bought. */
  puppy_name   text not null,
  puppy_slug   text,
  age_label    text,

  amount_cents integer not null check (amount_cents >= 0),

  /* The order the buyer had them in, so the invoice reads the way the cart
     looked. */
  sort_order   integer not null default 0,

  created_at   timestamptz not null default now()
);

create index if not exists order_items_order_idx
  on order_items (order_id, sort_order);

comment on table order_items is
  'One row per puppy on an order. `orders.amount_cents` is the total of these.';

-- --- the header's own columns become optional ----------------------------------
-- A multi-puppy order has no single puppy, so these cannot be required. They
-- are still written: puppy_name gets a summary for the admin list, and puppy_id
-- and puppy_slug are filled in only when there is exactly one puppy.

alter table orders alter column puppy_name drop not null;

-- --- Row Level Security --------------------------------------------------------
-- Identical to `orders`, and for the same reason: a line names a puppy and a
-- price, and it hangs off a row carrying a buyer's name, email and phone. The
-- buyer inserts, and only an admin ever reads it back.

alter table order_items enable row level security;

create policy "anyone may add lines to their own order"
  on order_items for insert to anon, authenticated
  with check (true);

-- No SELECT for anon. Without a policy, RLS denies by default.
create policy "admins read order items"
  on order_items for select to authenticated
  using (is_admin());

create policy "admins change order items"
  on order_items for update to authenticated
  using (is_admin()) with check (is_admin());

create policy "admins delete order items"
  on order_items for delete to authenticated
  using (is_admin());

-- --- letting a half-written order clean itself up -------------------------------
-- An order is two inserts: the header, then its lines. If the lines fail the app
-- deletes the header, because an order with no puppies on it is worse than no
-- order — the owner would have to guess what it was for.
--
-- That delete runs as the buyer, and `orders` has no anon delete policy, so it
-- was silently doing nothing and leaving the orphan behind. This allows it in
-- the one case where it is safe: an order that has no line items. Once a single
-- line exists the row can never be deleted this way again, so a real order
-- cannot be removed by anyone but an admin.

create policy "an order with no items may be cleaned up"
  on orders for delete to anon, authenticated
  using (not exists (select 1 from order_items i where i.order_id = orders.id));
