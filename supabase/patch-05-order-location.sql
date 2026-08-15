-- =============================================================================
-- Patch 05 — the buyer's address on an order
--
-- Run once, in the SQL editor.
--
-- The checkout now asks where the buyer is, and the invoice they are shown
-- afterwards prints it as the billing address. An invoice without one is not
-- really an invoice: it is what makes the document identify a person rather
-- than just a transaction.
--
-- Nullable, because orders taken before this patch have no address and
-- back-filling one would be inventing it. The invoice prints nothing at all
-- for those rather than an empty heading.
-- =============================================================================

alter table orders
  add column if not exists buyer_location text;

comment on column orders.buyer_location is
  'Billing address as the buyer typed it. Free text — this is a person''s '
  'address, not a validated postal record, and forcing it into fields loses '
  'more than it gains.';
