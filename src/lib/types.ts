/**
 * Shapes the UI works against. These mirror the database tables added in
 * step 4 — the components are written once and swapped from placeholder
 * arrays to query results without touching the markup.
 */

export type Sex = "dog" | "bitch";
export type DogRole = "sire" | "dam" | "retired" | "companion";
export type PuppyStatus = "available" | "reserved" | "placed";
export type LitterStatus = "planned" | "expected" | "born" | "weaning" | "placed";

export type Clearance = {
  /** "Hips", "Elbows", "Eyes", "EIC" — displayed as the row label. */
  type: string;
  /** "OFA Good", "Normal", "Clear" — displayed as the row value. */
  result: string;
  testedOn: string | null;
  certificateUrl: string | null;
};

export type Dog = {
  id: string;
  slug: string;
  name: string;
  callName: string | null;
  sex: Sex;
  colour: string;
  dob: string;
  role: DogRole;
  weightLbs: number | null;
  registryNumber: string | null;
  bio: string;
  heroImage: string;
  heroAlt: string;
  gallery: string[];
  clearances: Clearance[];
};

export type Puppy = {
  id: string;
  slug: string;
  name: string;
  sex: Sex;
  colour: string;
  collarColour: string;
  priceCents: number;
  status: PuppyStatus;
  heroImage: string;
  heroAlt: string;
  gallery: string[];
  notes: string | null;
  /** Denormalised for cards, so a listing does not need a join per row. */
  litterId: string;
  sireName: string;
  damName: string;
  bornOn: string | null;
  readyOn: string | null;
};

export type Litter = {
  id: string;
  /** "A-2025" — the code shown in the mono rows and on the brass tag. */
  code: string;
  sireName: string;
  damName: string;
  expectedOn: string | null;
  bornOn: string | null;
  readyOn: string | null;
  status: LitterStatus;
  notes: string;
};

export type Testimonial = {
  id: string;
  authorName: string;
  location: string;
  quote: string;
  photo: string | null;
  photoAlt: string | null;
  dogName: string | null;
  placedYear: number | null;
  isFeatured: boolean;
};
