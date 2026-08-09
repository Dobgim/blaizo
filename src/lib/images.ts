/**
 * Every image slot on the site, in one place.
 *
 * These are placeholders. The `alt` text is written for the photograph the
 * client is going to shoot, not for the stand-in currently sitting in the
 * slot — see IMAGES.md for the shot list. Swap `url` when the real files
 * land and the alt text is already correct.
 */

const UNSPLASH = "https://images.unsplash.com";

/** Placeholder source at a sensible base width; next/image resizes from here. */
function stand_in(id: string, w = 2400) {
  return `${UNSPLASH}/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

export type ImageSlot = {
  url: string;
  /** Written for a screen reader, describing the intended final photograph. */
  alt: string;
};

export const images = {
  home: {
    hero: {
      url: stand_in("photo-1500382017468-9049fed747ef", 3200),
      alt: "A yellow Labrador dam standing chest-deep in field grass, late afternoon light behind her.",
    },
    whelping: {
      url: stand_in("photo-1583512603805-3cc6b41f3edb", 1800),
      alt: "The whelping room in morning light, a low pine box lined with clean bedding beside a window.",
    },
    testimonial: {
      url: stand_in("photo-1558788353-f76d92427f16", 1400),
      alt: "A grown Labrador lying on a kitchen floor beside a family's boots.",
    },
  },

  parents: {
    sire: {
      url: stand_in("photo-1552053831-71594a27632d", 1600),
      alt: "A yellow Labrador sire photographed head-and-chest against open ground.",
    },
    damOne: {
      url: stand_in("photo-1518717758536-85ae29035b6d", 1600),
      alt: "A yellow Labrador dam photographed head-and-chest against open ground.",
    },
    damTwo: {
      url: stand_in("photo-1543466835-00a7907e9de1", 1600),
      alt: "A black Labrador dam photographed head-and-chest against open ground.",
    },
  },

  about: {
    land: {
      url: stand_in("photo-1470071459604-3b5ec3a7fe05", 3200),
      alt: "The ridge the kennel is named for, seen across pasture in low cloud.",
    },
    family: {
      url: stand_in("photo-1444212477490-ca407925329e", 2000),
      alt: "The family walking a line of Labradors along a fence at the edge of a field.",
    },
    facility: {
      url: stand_in("photo-1441974231531-c6227db76b6e", 3200),
      alt: "The kennel building and the woodland behind it, photographed from the drive.",
    },
  },

  process: {
    pairing: {
      url: stand_in("photo-1554224155-6726b3ff858f", 2000),
      alt: "An open stud book on a kitchen table, pedigree columns filled in by hand.",
    },
    xray: {
      url: stand_in("photo-1516387938699-a93567ec168e", 2400),
      alt: "A hip radiograph on a veterinary lightbox, both hip joints visible.",
    },
    training: {
      url: stand_in("photo-1507146426996-ef05306b995a", 2000),
      alt: "An eight-week-old Labrador puppy walking into an open crate on its own.",
    },
    goingHome: {
      url: stand_in("photo-1605568427561-40dd23c2acea", 2000),
      alt: "A puppy in a family's arms beside a car, its folder and blanket on the seat.",
    },
  },

  defaults: {
    dog: {
      url: stand_in("photo-1494947665470-20322015e3a8", 1600),
      alt: "A Labrador Retriever standing on open ground.",
    },
    puppy: {
      url: stand_in("photo-1587300003388-59208cc962cb", 1600),
      alt: "A Labrador puppy sitting on grass wearing a coloured collar.",
    },
    journal: {
      url: stand_in("photo-1516339901601-2e1b62dc0c45", 2000),
      alt: "A Labrador resting in long grass.",
    },
    contact: {
      url: stand_in("photo-1425082661705-1834bfd09dca", 2000),
      alt: "The gravel drive and gate at the entrance to the kennel.",
    },
    og: {
      url: stand_in("photo-1548199973-03cce0bbc87b", 1200),
      alt: "A Labrador Retriever in a field.",
    },
  },
} satisfies Record<string, Record<string, ImageSlot>>;
