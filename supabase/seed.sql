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
  ('birch', 'Golden Pup''s Second Wind', 'Birch', 'dog', 'Chocolate', '2021-03-14',
   'sire', 74, 'SR000000/01',
   'Birch works. He has spent five seasons in the grouse woods and still asks for one more field at the end of the day, then falls asleep under the kitchen table for eleven hours.',
   '/placeholders/dog-sire.jpg',
   'A chocolate Labrador standing alert in long field grass, head turned toward the treeline.',
   true, 1),

  ('hazel', 'Golden Pup''s Hazel Run', 'Hazel', 'bitch', 'Chocolate', '2021-04-02',
   'dam', 62, 'SR000000/02',
   'Hazel is the one who decides where everybody sleeps. Steady with children to the point of being boring about it, which is exactly what we breed her for.',
   '/placeholders/dog-dam-one.jpg',
   'A chocolate Labrador lying on a porch board floor with her chin on her paws.',
   true, 2),

  ('tessa', 'Golden Pup''s Tessa Grade', 'Tessa', 'bitch', 'Chocolate', '2022-08-19',
   'dam', 58, 'SR000000/03',
   'Tessa came back to us from a service programme that had more dogs than placements. She is the softest mouth on the property and the fastest learner we have owned.',
   '/placeholders/dog-dam-two.jpg',
   'A chocolate Labrador sitting in cut grass, looking directly at the camera.',
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
   'Seven puppies, all chocolate. Whelped in the sitting room over a Sunday night.',
   true),

  ('B-2025',
   (select id from dogs where slug = 'birch'),
   (select id from dogs where slug = 'tessa'),
   '2025-04-26', '2025-06-21', 'weaning',
   'Five puppies, all chocolate, two of them very dark.',
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
  ('A-2025', 'juniper', 'Juniper', 'bitch', 'Chocolate', 'Green',  75000, 'available',
   '/placeholders/default-puppy.jpg',
   'A chocolate Labrador puppy in a green collar sitting on cut grass.', 1),
  ('A-2025', 'ash', 'Ash', 'dog', 'Chocolate', 'Blue', 75000, 'available',
   '/placeholders/dog-sire.jpg',
   'A chocolate Labrador puppy in a blue collar standing on cut grass.', 2),
  ('A-2025', 'wren', 'Wren', 'bitch', 'Chocolate', 'Red', 75000, 'reserved',
   '/placeholders/default-dog.jpg',
   'A chocolate Labrador puppy in a red collar lying in cut grass.', 3),
  ('B-2025', 'sorrel', 'Sorrel', 'dog', 'Chocolate', 'Orange', 75000, 'available',
   '/placeholders/dog-dam-two.jpg',
   'A chocolate Labrador puppy in an orange collar sitting on cut grass.', 4)
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

-- --- admins -------------------------------------------------------------------
-- The kennel owner's account, created through the sign-up API. Without a row
-- here the account can sign in but cannot write anything, which is the point:
-- holding an account is not the same as being an administrator.
--
-- To add another administrator later, create the user under Authentication →
-- Users, then insert their id here. Do it deliberately; there is no way to do
-- it from inside the application.

insert into admins (user_id, email, note)
values (
  '8b4394b7-6ca5-4550-af6b-f2cc52e9b5fa',
  'dobgimajoshua52@gmail.com',
  'Kennel owner'
)
on conflict (user_id) do nothing;
