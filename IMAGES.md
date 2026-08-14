# Photography brief — Golden Pup Kennel

The site is photo-led. Layout is built around large, well-cropped images; weak
photography will undo the rest of the build. Every slot the site renders is
listed here with its crop, its job, and the alt text currently written for it.

Placeholders are Unsplash URLs, declared in one place: `src/lib/images.ts`.
Swap the `url` on a slot and it updates everywhere that slot appears. Alt text
lives beside it and should be rewritten to describe the real photograph.

---

## Shooting notes

**Light.** Early morning and the hour before sunset. Overcast is fine and
often better. No on-camera flash, no HDR, no heavy vignettes.

**Colour.** The palette is grey-green, brass and canvas. Photographs full of
saturated blue sky or bright primary-coloured toys will fight it. Favour
field grass, timber, worn metal, water, weather.

**People.** Hands and forearms doing real work beat posed faces. Where faces
appear, they should be unstyled and unstaged.

**What not to shoot.** Dogs in costumes. Dogs on white seamless. Anything
shot through a phone portrait-mode filter. Stacked show poses for a site
selling family dogs.

**Delivery.** Landscape slots at 3000px on the long edge minimum, portrait
slots at 2400px. Unedited RAW plus a JPEG selection. sRGB.

---

## Priority 1 — cannot launch without these

| Slot key | Page | Crop | What it needs to show |
|---|---|---|---|
| `home.hero` | `/` | 16:9, safe area lower-left for the headline | A dam working in field grass at dusk, mid-distance, room around her. The single most important photograph on the site. |
| `home.whelping` | `/` | 4:5 portrait, bleeds off the right edge | The whelping room in morning light. Clean, domestic, obviously inside a house. This is the anti-puppy-mill photograph. |
| `dog.hero` × per dog | `/dogs/[slug]` | 4:5 portrait | Each sire and dam, head-and-chest, eye contact, natural ground. One per dog, consistent framing across all of them. |
| `puppy.hero` × per puppy | `/puppies/[slug]` | 4:5 portrait | Each available puppy, alone, collar colour clearly visible. Reshoot weekly while a litter is listed. |
| `facility.hero` | `/about/facility` | 16:9 | The kennel building and its surroundings in one frame. Wide enough to show there is land. |

## Priority 2 — needed for the full build

| Slot key | Page | Crop | What it needs to show |
|---|---|---|---|
| `home.parents` | `/` | 4:5 × 3 | Sires and dams as a set. Same distance, same light, so the record cards line up. |
| `about.family` | `/about` | 3:2 | The family outdoors with the dogs. Not lined up facing camera. |
| `about.land` | `/about` | 21:9 panorama | The ridge itself. Establishes where the name comes from. |
| `process.pairing` | `/process/breeding-program` | 3:2 | The stud book or pedigree paperwork on a table, hands present. |
| `process.xray` | `/process/health-testing` | 21:9 crop | An actual hip x-ray plate on a lightbox. Ask the vet. |
| `process.eyes` | `/process/health-testing` | 3:2 | A CAER eye exam in progress. |
| `process.dna` | `/process/health-testing` | 3:2 | A cheek swab being taken, close. |
| `process.training` | `/process/training` | 3:2 × 4 | Crate, car ride, stairs, water introduction. One per milestone. |
| `process.goinghome` | `/process/going-home` | 3:2 | A puppy going into a family's car with its folder and blanket. |
| `contact.map` | `/contact` | 3:2 | The driveway and gate, so people know they have arrived. |

## Priority 3 — improves the site, can follow

| Slot key | Page | Crop | What it needs to show |
|---|---|---|---|
| `dog.gallery[]` | `/dogs/[slug]` | mixed | 6–10 per dog: working, swimming, resting, with people. |
| `puppy.gallery[]` | `/puppies/[slug]` | mixed | 4–8 per puppy, updated weekly. |
| `testimonial.photo` | `/about/reviews` | 1:1 | The grown dog in its new home, sent in by the owner. Phone photos are fine and read as more honest. |
| `journal.cover` | `/journal/[slug]` | 3:2 | One per post. |
| `og.default` | all | 1200×630 | Open Graph fallback. |

---

## Alt text policy

Alt text describes the photograph for someone who cannot see it, in a plain
sentence. It is not a place for keywords.

Write: `A yellow Labrador dam standing chest-deep in field grass at dusk.`
Not: `Labrador Retriever puppies for sale Vermont breeder health tested.`

Purely decorative images take `alt=""` and are hidden from screen readers.
There are currently none on the site — every image here carries meaning.

---

## Consent and rights

- Owner-submitted testimonial photos need written permission to publish.
- Anyone recognisable in a photograph needs to have agreed to it.
- Do not publish x-rays or certificates that carry a client's personal
  details without redacting them first.
