-- =============================================================================
-- Patch 03 — clear the demonstration animals
--
-- Run once, in the SQL editor, when you are ready to enter your own dogs and
-- puppies through the admin panel.
--
-- THIS DELETES DATA. It removes every dog, litter, puppy and clearance in the
-- database — not just the seeded ones — because after this point the admin
-- panel is the only thing that should be putting animals in there.
--
-- It deliberately does NOT touch:
--   * admins   — you would lock yourself out of the admin panel
--   * faqs     — real answers worth keeping; delete them in the admin panel
--                if you would rather write your own
--   * applications — enquiries from real people, apart from the one test row
--                    below
--
-- Nothing else has to be changed afterwards. The site shows its empty states
-- ("No puppies available right now — join the waiting list") until you add
-- your first litter.
-- =============================================================================

-- Order matters less than it looks — the foreign keys cascade — but deleting
-- children first keeps the intent obvious and the statement counts readable.

delete from puppies;
delete from clearances;
delete from litters;
delete from dogs;

-- The row left behind by the verification probe. Real applications are kept.
delete from applications where email = 'probe@example.com';

-- Empty already, but stated so a re-run leaves nothing behind.
delete from testimonials;
delete from posts;

-- --- confirm -----------------------------------------------------------------

select 'dogs (want 0)'         as check, count(*)::text as value from dogs
union all select 'litters (want 0)',      count(*)::text from litters
union all select 'puppies (want 0)',      count(*)::text from puppies
union all select 'clearances (want 0)',   count(*)::text from clearances
union all select 'faqs (kept)',           count(*)::text from faqs
union all select 'applications (kept)',   count(*)::text from applications
union all select 'administrators (must be 1+)', count(*)::text from admins;
