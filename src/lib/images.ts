/**
 * Every image slot on the site, in one place.
 *
 * `src` is what the site renders. `source` records where the placeholder came
 * from — an Unsplash photo — so the origin of every stand-in is traceable and
 * `npm run placeholders` can re-fetch them.
 *
 * The placeholders are vendored into /public rather than hotlinked. A client
 * site should not depend on a third-party CDN staying up or staying fast, and
 * remote fetches routinely blow past the image optimizer's timeout.
 *
 * `alt` is written for the photograph the client is going to shoot, not for
 * the stand-in currently in the slot — see IMAGES.md for the shot list. Drop
 * the real file in over the placeholder and the alt text is already correct.
 */

const UNSPLASH = "https://images.unsplash.com";

function unsplash(id: string, w: number) {
  return `${UNSPLASH}/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

export type ImageSlot = {
  /** Rendered path, under /public/placeholders. */
  src: string;
  /** Written for a screen reader, describing the intended final photograph. */
  alt: string;
  /** Where the placeholder was fetched from. */
  source: string;
};

function slot(key: string, id: string, w: number, alt: string): ImageSlot {
  return { src: `/placeholders/${key}.jpg`, alt, source: unsplash(id, w) };
}

export const images = {
  "home-hero": slot(
    "home-hero",
    "photo-1500382017468-9049fed747ef",
    2000,
    "A yellow Labrador dam standing chest-deep in field grass, late afternoon light behind her.",
  ),
  "home-whelping": slot(
    "home-whelping",
    "photo-1518717758536-85ae29035b6d",
    1400,
    "The whelping room in morning light, a low pine box lined with clean bedding beside a window.",
  ),
  "home-testimonial": slot(
    "home-testimonial",
    "photo-1558788353-f76d92427f16",
    1200,
    "A grown Labrador lying on a kitchen floor beside a family's boots.",
  ),

  "dog-sire": slot(
    "dog-sire",
    "photo-1552053831-71594a27632d",
    1100,
    "A yellow Labrador sire photographed head-and-chest against open ground.",
  ),
  "dog-dam-one": slot(
    "dog-dam-one",
    "photo-1518717758536-85ae29035b6d",
    1100,
    "A yellow Labrador dam photographed head-and-chest against open ground.",
  ),
  "dog-dam-two": slot(
    "dog-dam-two",
    "photo-1543466835-00a7907e9de1",
    1100,
    "A black Labrador dam photographed head-and-chest against open ground.",
  ),

  "about-land": slot(
    "about-land",
    "photo-1470071459604-3b5ec3a7fe05",
    2000,
    "The ridge the kennel is named for, seen across pasture in low cloud.",
  ),
  "about-family": slot(
    "about-family",
    "photo-1444212477490-ca407925329e",
    1600,
    "The family walking a line of Labradors along a fence at the edge of a field.",
  ),
  "about-facility": slot(
    "about-facility",
    "photo-1441974231531-c6227db76b6e",
    2000,
    "The kennel building and the woodland behind it, photographed from the drive.",
  ),

  "process-pairing": slot(
    "process-pairing",
    "photo-1554224155-6726b3ff858f",
    1600,
    "An open stud book on a kitchen table, pedigree columns filled in by hand.",
  ),
  "process-xray": slot(
    "process-xray",
    "photo-1516387938699-a93567ec168e",
    1600,
    "A hip radiograph on a veterinary lightbox, both hip joints visible.",
  ),
  "process-training": slot(
    "process-training",
    "photo-1507146426996-ef05306b995a",
    1600,
    "An eight-week-old Labrador puppy walking into an open crate on its own.",
  ),
  "process-going-home": slot(
    "process-going-home",
    "photo-1605568427561-40dd23c2acea",
    1600,
    "A puppy in a family's arms beside a car, its folder and blanket on the seat.",
  ),

  "default-dog": slot(
    "default-dog",
    "photo-1494947665470-20322015e3a8",
    1100,
    "A Labrador Retriever standing on open ground.",
  ),
  "default-puppy": slot(
    "default-puppy",
    "photo-1587300003388-59208cc962cb",
    1100,
    "A Labrador puppy sitting on grass wearing a coloured collar.",
  ),
  "default-journal": slot(
    "default-journal",
    "photo-1516339901601-2e1b62dc0c45",
    1600,
    "A Labrador resting in long grass.",
  ),
  "default-contact": slot(
    "default-contact",
    "photo-1470240731273-7821a6eeb6bd",
    1600,
    "The hill meadow at dusk on the approach to the farm, with the treeline behind it.",
  ),
  "default-og": slot(
    "default-og",
    "photo-1548199973-03cce0bbc87b",
    1200,
    "A Labrador Retriever in a field.",
  ),
} satisfies Record<string, ImageSlot>;

export type ImageKey = keyof typeof images;
