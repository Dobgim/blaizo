import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { getTestimonials } from "@/lib/queries";
import type { Testimonial } from "@/lib/types";

/**
 * Four placement letters.
 *
 * When the `testimonials` table has real entries this renders them and nothing
 * else. Until then it renders the same layout with sample copy and *bracketed*
 * attribution — "[Owner name], [Town]" — never an invented family.
 *
 * That distinction is the whole point. A writing sample with an empty name
 * slot shows the client the tone, the length and the shape. The moment you
 * attach "Sarah M., Burlington VT" to it, it becomes a fabricated consumer
 * endorsement: illegal under the FTC's 2024 Rule on Consumer Reviews and
 * Testimonials, and the precise thing an anxious buyer comparing breeders is
 * scanning for. The layout is finished either way; only the words are pending.
 */

type Card = {
  quote: string;
  author: string;
  location: string;
  dog: string;
  year: string;
  isSample: boolean;
};

/** Tone and length guides, deliberately unattributed. */
const SAMPLES: Card[] = [
  {
    quote:
      "What surprised me was how little of the work was left to us. She came home already used to the crate, the car and the vacuum cleaner, and slept through the second night. Two years on she is the calmest dog at the pond.",
    author: "[Owner name]",
    location: "[Town, State]",
    dog: "[Dog name]",
    year: "[Year]",
    isSample: true,
  },
  {
    quote:
      "We asked for the hip scores and had them by email the same evening, with the registry numbers so we could look them up ourselves. After four months of talking to breeders who got vague at that question, it decided us.",
    author: "[Owner name]",
    location: "[Town, State]",
    dog: "[Dog name]",
    year: "[Year]",
    isSample: true,
  },
  {
    quote:
      "They talked us out of the litter we first asked about. Wrong timing for our two children, they said, wait for the spring one. Nobody selling you a three thousand dollar dog tells you to wait unless they mean it.",
    author: "[Owner name]",
    location: "[Town, State]",
    dog: "[Dog name]",
    year: "[Year]",
    isSample: true,
  },
  {
    quote:
      "He is four now and has hunted three seasons. Still ring us at Christmas to ask how he is getting on, and still send photographs of his sister. It does not feel like a transaction that ended when we drove away.",
    author: "[Owner name]",
    location: "[Town, State]",
    dog: "[Dog name]",
    year: "[Year]",
    isSample: true,
  },
];

function toCard(t: Testimonial): Card {
  return {
    quote: t.quote,
    author: t.authorName,
    location: t.location,
    dog: t.dogName ?? "",
    year: t.placedYear ? String(t.placedYear) : "",
    isSample: false,
  };
}

/* Offsets that keep the wall off a strict 2×2 grid — the brief asks for
   asymmetry, and four identical boxes is the pattern it bans. */
const PLACEMENT = [
  "lg:col-span-5 lg:col-start-1",
  "lg:col-span-5 lg:col-start-7 lg:mt-16",
  "lg:col-span-5 lg:col-start-2 lg:-mt-4",
  "lg:col-span-5 lg:col-start-8 lg:mt-4",
];

export async function ReviewsWall() {
  const real = await getTestimonials();
  const cards: Card[] =
    real.length > 0 ? real.slice(0, 4).map(toCard) : SAMPLES;

  const showingSamples = cards.some((c) => c.isSample);

  return (
    <section
      aria-labelledby="reviews-heading"
      className="bg-ledger-deep py-20 lg:py-28"
    >
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-2">
            <p className="eyebrow text-brass-text">Placements</p>
          </div>

          <div className="lg:col-span-8 lg:col-start-3">
            <h2 id="reviews-heading" className="text-h2 text-spruce">
              What the families said afterwards
            </h2>
            <p className="measure mt-4 text-body text-canvas-deep">
              We ask everyone the same question two years on: what surprised
              you? Surprise is the detail that reads as true, and it is more
              use to you than another sentence about how happy somebody is.
            </p>
          </div>
        </div>

        {/* Said once, at the top, rather than stamped across every card. */}
        {showingSamples && (
          <div className="mt-10 grid lg:grid-cols-12">
            <p className="border-l-2 border-foxred bg-ledger-bright px-5 py-4 text-small text-canvas-deep lg:col-span-8 lg:col-start-3">
              <span className="eyebrow text-foxred">
                Sample copy · awaiting real letters
              </span>
              <span className="mt-2 block">
                The four below show the tone and length to aim for. The names
                are left as brackets on purpose — no invented family appears on
                this site. Add the real ones under Placements in the admin
                panel and they replace these automatically.
              </span>
            </p>
          </div>
        )}

        <Reveal
          stagger
          staggerAmount={0.08}
          className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0"
        >
          {cards.map((card, i) => (
            <figure
              key={i}
              className={`border-t-2 border-brass bg-ledger-bright p-7 ${PLACEMENT[i]}`}
            >
              <blockquote className="font-display text-h3 leading-snug text-spruce">
                <p>{card.quote}</p>
              </blockquote>

              <figcaption className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-enamel pt-4">
                <span
                  className={`eyebrow ${card.isSample ? "text-canvas" : "text-spruce"}`}
                >
                  {card.author}
                </span>
                {card.location && (
                  <span className="eyebrow text-canvas-deep">
                    {card.location}
                  </span>
                )}
                {card.dog && (
                  <span className="ml-auto font-mono text-micro uppercase tracking-label text-brass-text">
                    {card.dog}
                    {card.year && ` · ${card.year}`}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </Reveal>

        <div className="mt-14 grid lg:grid-cols-12">
          <p className="lg:col-span-8 lg:col-start-3">
            <Link
              href="/about/reviews"
              className="border-b border-brass pb-1 text-body-l text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
            >
              Every placement we have made
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
