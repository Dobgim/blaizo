/**
 * The process pages, as a sequence.
 *
 * This is the one place on the site where 01 / 02 / 03 numbering is earned:
 * the content genuinely is an order of events, from choosing a pairing to a
 * puppy sleeping in your house. The About pages are not a sequence and do not
 * get numbers.
 */

export type ProcessPage = {
  n: string;
  slug: string;
  title: string;
  /** Shown on the hub. One sentence, no throat-clearing. */
  summary: string;
};

export const processPages: ProcessPage[] = [
  {
    n: "01",
    slug: "breeding-program",
    title: "The breeding program",
    summary:
      "How a pairing gets chosen, and the seasons we skip when it is not right.",
  },
  {
    n: "02",
    slug: "health-testing",
    title: "Health testing",
    summary:
      "Hips, elbows, eyes and the DNA panel — what each test is, and what a pass actually means.",
  },
  {
    n: "03",
    slug: "training",
    title: "Early training",
    summary:
      "What a Golden Pup puppy already knows before it ever sees your house.",
  },
  {
    n: "04",
    slug: "guarantee",
    title: "The health guarantee",
    summary: "The warranty in full, including the parts most breeders summarise.",
  },
  {
    n: "05",
    slug: "going-home",
    title: "Going home",
    summary:
      "Collection, delivery, flight nanny, and everything in the folder that travels with the puppy.",
  },
];

export function processNeighbours(slug: string) {
  const i = processPages.findIndex((p) => p.slug === slug);
  return {
    current: processPages[i] ?? null,
    previous: i > 0 ? processPages[i - 1] : null,
    next: i >= 0 && i < processPages.length - 1 ? processPages[i + 1] : null,
  };
}
