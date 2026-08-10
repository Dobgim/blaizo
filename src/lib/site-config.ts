/**
 * Single source of truth for everything the client has to supply.
 *
 * Anything still marked PLACEHOLDER is not invented data — it is a slot with
 * a clearly-labelled value so nothing on the page ever asserts something
 * untrue. Replace the values, delete the PLACEHOLDER markers, and the site
 * updates everywhere.
 */

export const siteConfig = {
  name: "Ridgeline Retrievers",
  /** Used in <title> templates and the footer mark. */
  shortName: "Ridgeline",
  breed: "Labrador Retriever",
  /**
   * Drives the DNA panel copy on /process/health-testing. Switching this to
   * "Golden Retriever" changes the panel to PRA1 / PRA2 / ICT / DM.
   */
  breedKey: "labrador" as "labrador" | "golden",

  tagline: "Eight litters a year. Every one of them accounted for.",

  /**
   * The hero headline, as three masked lines.
   *
   * PLACEHOLDER — "eight litters a year" is a factual claim about the
   * business and the client has to confirm or change the number before this
   * goes live. Kept here rather than in the page so there is exactly one
   * place to correct it.
   */
  heroHeadline: [
    "Eight litters a year.",
    "Every one of them",
    "accounted for.",
  ],
  description:
    "A family kennel raising health-tested Labrador Retrievers for families and hunters. Hips, elbows, eyes and a full DNA panel on both parents, with the certificates published.",

  /** PLACEHOLDER — client to confirm. */
  establishedYear: 1998,

  contact: {
    /** PLACEHOLDER — client to confirm. */
    phone: "(802) 555-0142",
    phoneHref: "tel:+18025550142",
    email: "hello@ridgelineretrievers.com",

    /**
     * WhatsApp is where every enquiry lands. No payment is taken on this
     * site — the application form hands off to a WhatsApp conversation with
     * the answers already written out.
     *
     * PLACEHOLDER — must be the kennel's real WhatsApp Business number, in
     * full international format, digits only, no plus sign and no spaces.
     * wa.me rejects anything else.
     */
    whatsappNumber: "18025550142",
    /** How the same number is shown to a reader. */
    whatsappDisplay: "+1 (802) 555-0142",
    /** PLACEHOLDER — client to confirm town before launch. */
    addressLine: "1408 Ridge Road",
    locality: "PLACEHOLDER TOWN",
    region: "VT",
    postalCode: "05001",
    country: "US",
    /** PLACEHOLDER — approximate, used for the ledger rail and map. */
    lat: 44.4,
    lng: -72.7,
    hours: [
      { days: "Monday – Friday", time: "8:00am – 6:00pm" },
      { days: "Saturday", time: "9:00am – 2:00pm" },
      { days: "Sunday", time: "Visits by appointment" },
    ],
  },

  /**
   * Count-up statistics.
   *
   * The brief asks for counting numbers and also bans fake statistics, so
   * these are null until the client supplies real figures. The home page
   * stats band does not render while any value here is null — no invented
   * numbers ship, and nothing has to be removed later.
   */
  stats: {
    yearsBreeding: null as number | null,
    littersWhelped: null as number | null,
    dogsHealthTested: null as number | null,
  },

  /** Registries and clearance bodies named in the marquee. All real orgs. */
  registries: [
    "AKC Registered",
    "OFA Hips",
    "OFA Elbows",
    "CAER Eye Exam",
    "EIC Clear",
    "PRA-prcd Clear",
    "CNM Clear",
    "Embark Tested",
  ],

  url: "https://ridgelineretrievers.com",
} as const;

export type SiteConfig = typeof siteConfig;

/** True only when the client has filled in every stat. */
export const hasStats = Object.values(siteConfig.stats).every(
  (v) => typeof v === "number",
);
