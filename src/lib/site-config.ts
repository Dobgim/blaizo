/**
 * Single source of truth for everything the client has to supply.
 *
 * Anything still marked PLACEHOLDER is not invented data — it is a slot with
 * a clearly-labelled value so nothing on the page ever asserts something
 * untrue. Replace the values, delete the PLACEHOLDER markers, and the site
 * updates everywhere.
 */

/**
 * The canonical origin, resolved for wherever this build is running.
 *
 * Order matters. NEXT_PUBLIC_SITE_URL wins so the production domain can be set
 * explicitly; VERCEL_PROJECT_PRODUCTION_URL keeps canonicals correct on Vercel
 * before a custom domain is attached; VERCEL_URL covers preview deployments,
 * where a hardcoded production URL would make every preview's metadata,
 * sitemap and JSON-LD point at the wrong host. Localhost is the last resort.
 */
function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  const preview = process.env.VERCEL_URL;
  if (preview) return `https://${preview}`;

  return "http://localhost:3000";
}

export const siteConfig = {
  name: "Golden Pup Kennel",
  /** Used in <title> templates and the footer mark. */
  shortName: "Golden Pup",
  breed: "Chocolate Labrador Retriever",
  /**
   * Drives the DNA panel copy on /process/health-testing. Switching this to
   * "Golden Retriever" changes the panel to PRA1 / PRA2 / ICT / DM.
   */
  breedKey: "labrador" as "labrador" | "golden",

  tagline: "Three litters a year. Every one of them accounted for.",

  /**
   * The hero headline, as three masked lines.
   *
   * "Three litters a year" is a factual claim about the business — confirm
   * the number before launch. Kept here rather than in the page so there is
   * exactly one place to correct it.
   */
  heroHeadline: [
    "Three litters a year.",
    "Every one of them",
    "accounted for.",
  ],
  description:
    "A family kennel raising health-tested chocolate Labrador Retrievers for families and hunters. Hips, elbows, eyes and a full DNA panel on both parents, with the certificates published.",

  establishedYear: 2024,

  contact: {
    phone: "(202) 643-8872",
    phoneHref: "tel:+12026438872",
    email: "hello@goldenpupkennel.com",

    /**
     * WhatsApp is for questions, not for ordering. Orders go through
     * /checkout, which sends a receipt by email.
     *
     * Digits only, full international format, no plus sign and no spaces —
     * wa.me rejects anything else. Same line as the phone number above.
     */
    whatsappNumber: "12026438872",
    /** How the same number is shown to a reader. */
    whatsappDisplay: "+1 (202) 643-8872",
    addressLine: "Petworth",
    locality: "Washington",
    region: "DC",
    postalCode: "20011",
    country: "US",
    /** Petworth, DC. Used for the ledger rail coordinates and the map link. */
    lat: 38.94,
    lng: -77.02,
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

/**
 * The payment methods a buyer can choose at checkout.
 *
 * No handles here on purpose. The site never shows an account, tag or number:
 * the buyer chooses a method, and the kennel sends the details personally
 * afterwards. That removes the single most dangerous moment in a transfer-based
 * sale — payment details published on a page, or emailed automatically, are
 * details an attacker can substitute. Given by a person on a call, they cannot.
 */
  payments: [
    { id: "zelle", label: "Zelle" },
    { id: "cashapp", label: "Cash App" },
    { id: "chime", label: "Chime" },
    { id: "applepay", label: "Apple Pay" },
  ],

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

  url: siteUrl(),
} as const;

export type SiteConfig = typeof siteConfig;
export type PaymentMethod = (typeof siteConfig.payments)[number];

/** The methods offered at checkout. */
export const paymentMethods = siteConfig.payments;

/** True only when the client has filled in every stat. */
export const hasStats = Object.values(siteConfig.stats).every(
  (v) => typeof v === "number",
);
