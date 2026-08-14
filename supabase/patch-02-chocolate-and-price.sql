-- =============================================================================
-- Patch 02 — chocolate Labradors, and $750
--
-- Run this once, in the SQL editor, after patch-01.
--
-- setup.sql seeded the database before the kennel confirmed it breeds
-- chocolate Labradors at $750. Editing the seed file does not help: it only
-- runs against an empty database. These are UPDATEs against the rows that are
-- already there.
--
-- Only the demonstration rows are touched. Anything entered through the admin
-- panel is matched by slug, so nothing you have added yourself is affected.
--
-- Safe to re-run.
-- =============================================================================

-- --- the parents ----------------------------------------------------------------

update dogs set
  colour   = 'Chocolate',
  hero_alt = case slug
    when 'birch' then 'A chocolate Labrador standing alert in long field grass, head turned toward the treeline.'
    when 'hazel' then 'A chocolate Labrador lying on a porch board floor with her chin on her paws.'
    when 'tessa' then 'A chocolate Labrador sitting in cut grass, looking directly at the camera.'
    else hero_alt
  end
where slug in ('birch', 'hazel', 'tessa');

-- --- the puppies ------------------------------------------------------------------
-- $750 is 75000 cents. The column is an integer count of cents, never a float.

update puppies set
  colour      = 'Chocolate',
  price_cents = 75000,
  hero_alt    = case slug
    when 'juniper' then 'A chocolate Labrador puppy in a green collar sitting on cut grass.'
    when 'ash'     then 'A chocolate Labrador puppy in a blue collar standing on cut grass.'
    when 'wren'    then 'A chocolate Labrador puppy in a red collar lying in cut grass.'
    when 'sorrel'  then 'A chocolate Labrador puppy in an orange collar sitting on cut grass.'
    else hero_alt
  end
where slug in ('juniper', 'ash', 'wren', 'sorrel');

-- --- the litter notes ---------------------------------------------------------------

update litters
set notes = 'Seven puppies, all chocolate. Whelped in the sitting room over a Sunday night.'
where code = 'A-2025';

update litters
set notes = 'Five puppies, all chocolate, two of them very dark.'
where code = 'B-2025';

-- --- make sure the owner is an administrator ------------------------------------------
-- Repeated from patch-01 in case that insert found no matching account at the
-- time. Harmless if it already ran.

insert into admins (user_id, email, note)
select id, email, 'Kennel owner'
from auth.users
where email in ('dobgimajoshua52@gmail.com', 'goldenpupkennel12@gmail.com')
on conflict (user_id) do nothing;

-- --- confirm -----------------------------------------------------------------------

select 'administrators' as check, count(*)::text as value from admins
union all
select 'non-chocolate dogs (want 0)', count(*)::text from dogs where colour <> 'Chocolate'
union all
select 'non-chocolate puppies (want 0)', count(*)::text from puppies where colour <> 'Chocolate'
union all
select 'puppies not at $750 (want 0)', count(*)::text from puppies where price_cents is distinct from 75000
union all
select 'permissive write policies (want 0)', count(*)::text
  from pg_policies where schemaname = 'public' and qual = 'true' and cmd <> 'INSERT';
