-- =============================================================================
-- Patch 06 — an age you type, and puppies that do not need a litter
--
-- Run once, in the SQL editor.
--
-- Two changes, and the second is only needed because of the first.
--
-- 1. `age_label`. The site was working the age out from `born_on` on the
--    litter, and printing the two dates. The owner would rather just say
--    "8 months old", because that is what a buyer asks and what the owner
--    already knows. Free text on purpose: "8 weeks", "almost 4 months" and
--    "ready now" are all things a person legitimately wants to write, and a
--    number with a unit dropdown cannot say the last one.
--
-- 2. `litter_id` becomes nullable. The Litters and Dogs screens are being
--    taken out of the admin panel, so there will be no way to create a litter
--    to attach a new puppy to. A required foreign key to a table you cannot
--    add rows to is a puppy you cannot add.
--
--    That forces the read policy to change too. It currently requires a
--    published litter, so a puppy with no litter would be invisible however
--    published it was — the puppy would save, and then never appear. The new
--    policy keeps the old behaviour for puppies that DO have a litter, and
--    falls back to the puppy's own flag for those that do not.
--
-- Nothing is dropped and nothing is back-filled. Existing puppies keep their
-- litter and behave exactly as before.
-- =============================================================================

-- --- 1. the age ---------------------------------------------------------------

alter table puppies
  add column if not exists age_label text;

comment on column puppies.age_label is
  'Age as the owner would say it out loud — "8 weeks old", "3 months". Free '
  'text, not a computed value: it is written by hand and shown verbatim.';

-- --- 2. puppies without a litter ----------------------------------------------

alter table puppies
  alter column litter_id drop not null;

drop policy if exists "puppies are publicly readable when published" on puppies;

create policy "puppies are publicly readable when published"
  on puppies for select to anon, authenticated
  using (
    is_published
    and (
      /* No litter: the puppy's own flag is the whole answer. */
      litter_id is null
      /* Attached to a litter: unpublishing the litter still hides it. */
      or exists (
        select 1 from litters l
        where l.id = puppies.litter_id and l.is_published
      )
    )
  );
