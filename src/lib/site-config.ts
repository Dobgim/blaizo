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
 * How a buyer pays.
 *
 * None of these can be charged programmatically — they are all manual
 * transfers the buyer makes themselves — so the checkout records the order,
 * emails a receipt with these details on it, and the buyer sends the money.
 * Nothing on this site ever touches a card number.
 *
 * PLACEHOLDER handles. Every one of these must be the kennel's real account
 * before launch, or buyers will send money into the void. `enabled: false`
 * hides a method from the checkout entirely.
 */
  payments: [
    {
      id: "zelle",
      label: "Zelle",
      handle: "PLACEHOLDER — Zelle email or phone",
      instruction: "Send from your bank's Zelle screen to the address above.",
      enabled: true,
    },
    {
      id: "cashapp",
      label: "Cash App",
      handle: "PLACEHOLDER — $cashtag",
      instruction: "Send to the $cashtag above and put your order number in the note.",
      enabled: true,
    },
    {
      id: "chime",
      label: "Chime",
      handle: "PLACEHOLDER — Chime $ChimeSign",
      instruction: "Send with Chime Pay Anyone to the tag above.",
      enabled: true,
    },
    {
      id: "applepay",
      label: "Apple Pay",
      handle: "PLACEHOLDER — Apple Pay phone number",
      instruction:
        "Send through Apple Cash in Messages to the number above. Of the four, this is the one that runs on your card.",
      enabled: true,
    },
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

/** The methods actually offered at checkout. */
export const paymentMethods = siteConfig.payments.filter((m) => m.enabled);

/** True while any handle is still a placeholder — the checkout warns on it. */
export const paymentsNeedSetup = paymentMethods.some((m) =>
  m.handle.startsWith("PLACEHOLDER"),
);

/** True only when the client has filled in every stat. */
export const hasStats = Object.values(siteConfig.stats).every(
  (v) => typeof v === "number",
);
