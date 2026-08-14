/**
 * Hardcoded content for step 3, replaced by Supabase queries in step 5.
 *
 * These are demonstration records, not claims. Registry numbers are zero-
 * filled so they cannot be mistaken for real AKC numbers, and the clearance
 * results are illustrative — the client replaces every one of them from the
 * actual certificates before launch.
 *
 * There are deliberately no invented testimonials and no invented statistics
 * here. See `placeholderTestimonial` below and `siteConfig.stats`.
 */

import { images } from "@/lib/images";
import type { Dog, Litter, Puppy } from "@/lib/types";

export const placeholderLitters: Litter[] = [
  {
    id: "litter-a-2025",
    code: "A-2025",
    sireName: "Birch",
    damName: "Hazel",
    expectedOn: null,
    bornOn: "2025-04-12",
    readyOn: "2025-06-07",
    status: "weaning",
    notes:
      "Seven puppies, all yellow. Whelped in the sitting room over a Sunday night.",
  },
  {
    id: "litter-b-2025",
    code: "B-2025",
    sireName: "Birch",
    damName: "Tessa",
    expectedOn: null,
    bornOn: "2025-04-26",
    readyOn: "2025-06-21",
    status: "weaning",
    notes: "Five puppies, three black and two yellow.",
  },
  {
    id: "litter-c-2025",
    code: "C-2025",
    sireName: "Birch",
    damName: "Hazel",
    expectedOn: "2025-12-10",
    bornOn: null,
    readyOn: null,
    status: "planned",
    notes:
      "Planned for December, pending Hazel's next clear eye examination. The waiting list opens once the pairing is confirmed, and we will not confirm it before she is cleared.",
  },
];

export const placeholderDogs: Dog[] = [
  {
    id: "dog-birch",
    slug: "birch",
    name: "Ridgeline's Second Wind",
    callName: "Birch",
    sex: "dog",
    colour: "Yellow",
    dob: "2021-03-14",
    role: "sire",
    weightLbs: 74,
    registryNumber: "SR000000/01",
    bio: "Birch works. He has spent five seasons in the grouse woods and still asks for one more field at the end of the day, then falls asleep under the kitchen table for eleven hours.",
    heroImage: images["dog-sire"].src,
    heroAlt: images["dog-sire"].alt,
    gallery: [],
    clearances: [
      { type: "Hips", result: "OFA Excellent", testedOn: "2023-04-11", certificateUrl: null },
      { type: "Elbows", result: "OFA Normal", testedOn: "2023-04-11", certificateUrl: null },
      { type: "Eyes", result: "CAER Clear", testedOn: "2025-01-20", certificateUrl: null },
      { type: "DNA", result: "5-panel clear", testedOn: "2021-08-02", certificateUrl: null },
    ],
  },
  {
    id: "dog-hazel",
    slug: "hazel",
    name: "Ridgeline's Hazel Run",
    callName: "Hazel",
    sex: "bitch",
    colour: "Yellow",
    dob: "2021-04-02",
    role: "dam",
    weightLbs: 62,
    registryNumber: "SR000000/02",
    bio: "Hazel is the one who decides where everybody sleeps. Steady with children to the point of being boring about it, which is exactly what we breed her for.",
    heroImage: images["dog-dam-one"].src,
    heroAlt: images["dog-dam-one"].alt,
    gallery: [],
    clearances: [
      { type: "Hips", result: "OFA Good", testedOn: "2023-06-08", certificateUrl: null },
      { type: "Elbows", result: "OFA Normal", testedOn: "2023-06-08", certificateUrl: null },
      { type: "Eyes", result: "CAER Clear", testedOn: "2025-01-20", certificateUrl: null },
      { type: "DNA", result: "5-panel clear", testedOn: "2021-09-15", certificateUrl: null },
    ],
  },
  {
    id: "dog-tessa",
    slug: "tessa",
    name: "Ridgeline's Tessa Grade",
    callName: "Tessa",
    sex: "bitch",
    colour: "Black",
    dob: "2022-08-19",
    role: "dam",
    weightLbs: 58,
    registryNumber: "SR000000/03",
    bio: "Tessa came back to us from a service programme that had more dogs than placements. She is the softest mouth on the property and the fastest learner we have owned.",
    heroImage: images["dog-dam-two"].src,
    heroAlt: images["dog-dam-two"].alt,
    gallery: [],
    clearances: [
      { type: "Hips", result: "OFA Good", testedOn: "2024-09-30", certificateUrl: null },
      { type: "Elbows", result: "OFA Normal", testedOn: "2024-09-30", certificateUrl: null },
      { type: "Eyes", result: "CAER Clear", testedOn: "2025-01-20", certificateUrl: null },
      { type: "DNA", result: "5-panel clear", testedOn: "2022-12-04", certificateUrl: null },
    ],
  },
];

export const placeholderPuppies: Puppy[] = [
  {
    id: "pup-01",
    slug: "juniper",
    name: "Juniper",
    sex: "bitch",
    colour: "Yellow",
    collarColour: "Green",
    priceCents: 320000,
    status: "available",
    heroImage: images["default-puppy"].src,
    heroAlt: "A yellow Labrador puppy in a green collar sitting on cut grass.",
    gallery: [],
    notes: null,
    litterId: "A-2025",
    sireName: "Birch",
    damName: "Hazel",
    bornOn: "2025-04-12",
    readyOn: "2025-06-07",
  },
  {
    id: "pup-02",
    slug: "ash",
    name: "Ash",
    sex: "dog",
    colour: "Yellow",
    collarColour: "Blue",
    priceCents: 320000,
    status: "available",
    heroImage: images["dog-sire"].src,
    heroAlt: "A yellow Labrador puppy in a blue collar standing on cut grass.",
    gallery: [],
    notes: null,
    litterId: "A-2025",
    sireName: "Birch",
    damName: "Hazel",
    bornOn: "2025-04-12",
    readyOn: "2025-06-07",
  },
  {
    id: "pup-03",
    slug: "wren",
    name: "Wren",
    sex: "bitch",
    colour: "Yellow",
    collarColour: "Red",
    priceCents: 320000,
    status: "reserved",
    heroImage: images["default-dog"].src,
    heroAlt: "A yellow Labrador puppy in a red collar lying in cut grass.",
    gallery: [],
    notes: null,
    litterId: "A-2025",
    sireName: "Birch",
    damName: "Hazel",
    bornOn: "2025-04-12",
    readyOn: "2025-06-07",
  },
  {
    id: "pup-04",
    slug: "sorrel",
    name: "Sorrel",
    sex: "dog",
    colour: "Black",
    collarColour: "Orange",
    priceCents: 320000,
    status: "available",
    heroImage: images["dog-dam-two"].src,
    heroAlt: "A black Labrador puppy in an orange collar sitting on cut grass.",
    gallery: [],
    notes: null,
    litterId: "B-2025",
    sireName: "Birch",
    damName: "Tessa",
    bornOn: "2025-04-26",
    readyOn: "2025-06-21",
  },
];

/**
 * No invented testimonial ships. The home page renders this slot as an
 * obvious, styled placeholder so the client can see exactly where their
 * owners' words go and how much room they have — and so nobody mistakes a
 * writing sample for a real family's endorsement.
 *
 * Delete this and populate the `testimonials` table; the section switches to
 * real quotes automatically.
 */
export const placeholderTestimonial = {
  words: 45,
  slotLabel: "Owner placement letter",
  guidance:
    "One long quote from a family who has had their dog two years or more. Ask them what surprised them, not whether they were happy — surprise is the detail that reads as true. Around forty words. Their own photograph of the grown dog at home works better here than anything we could shoot.",
} as const;

export const processSteps = [
  {
    n: "01",
    title: "Pairing",
    body: "We choose the sire for what the dam needs, not for what is convenient. Both dogs are cleared before a mating is planned, and we skip a season if the pairing is not right.",
    href: "/process/breeding-program",
  },
  {
    n: "02",
    title: "Whelping",
    body: "Puppies are born in the house and stay there. Somebody sleeps beside the box for the first ten nights, and the vet sees the litter at forty-eight hours.",
    href: "/process/breeding-program",
  },
  {
    n: "03",
    title: "Weeks three to eight",
    body: "Crates, car rides, stairs, gunfire at a distance, a vacuum cleaner, children, and a floor that moves. By eight weeks a Ridgeline puppy has met the things that frighten dogs.",
    href: "/process/training",
  },
  {
    n: "04",
    title: "Going home",
    body: "You collect, we deliver within four hours' drive, or a flight nanny brings the puppy to you. Whichever way, the folder comes with it.",
    href: "/process/going-home",
  },
] as const;

export const reasons = [
  {
    title: "Both parents cleared, and you can read the certificates",
    body: "Hips and elbows scored by the OFA at two years or older, eyes examined annually, and a full DNA panel. Every certificate is published on the dog's own page. If a breeder will not show you these, that is your answer.",
  },
  {
    title: "Raised in the house, not in a run",
    body: "The whelping box is in the sitting room. Puppies are handled every day by the whole family, and they meet the noises of an ordinary house long before they ever meet yours.",
  },
  {
    title: "You meet the dam before you commit",
    body: "In the house she lives in. We will not do car park handovers and we will not sell you a puppy you have never seen in person unless we have spoken at length first.",
  },
  {
    title: "We take the dog back. Always.",
    body: "At eight weeks or at eight years, for any reason, with no questions and no fee. It is written into the contract, and it is the promise we would judge another breeder by.",
  },
] as const;
