import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { placeholderTestimonial } from "@/lib/placeholder-data";
import type { Testimonial } from "@/lib/types";

/**
 * One long quote against the family's own photograph of the grown dog.
 *
 * Not three quote cards in a row — that is the law-firm move, and volume
 * belongs on /about/reviews where somebody looking for it will go.
 *
 * With no real testimonial in the database this renders a labelled empty
 * slot instead of an invented one. Nothing on this site pretends a family
 * said something they did not say.
 */
export function PlacementQuote({
  testimonial,
}: {
  testimonial: Testimonial | null;
}) {
  return (
    <section
      aria-labelledby="placement-heading"
      className="shell py-20 lg:py-28"
    >
      <h2 id="placement-heading" className="sr-only">
        From a family we placed a dog with
      </h2>

      <Reveal className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          {testimonial?.photo ? (
            <div className="relative aspect-[4/5] overflow-hidden bg-canvas">
              <Image
                src={testimonial.photo}
                alt={testimonial.photoAlt ?? ""}
                fill
                sizes="(max-width: 1024px) 90vw, 30vw"
                className="object-cover"
              />
            </div>
          ) : (
            <PhotoSlot />
          )}
        </div>

        <div className="flex flex-col justify-center lg:col-span-7 lg:col-start-6">
          {testimonial ? (
            <figure>
              <blockquote className="font-display text-[clamp(1.5rem,2.4vw,2.125rem)] leading-[1.25] text-spruce">
                <p>{testimonial.quote}</p>
              </blockquote>
              <figcaption className="eyebrow mt-7 text-canvas-deep">
                {testimonial.authorName} · {testimonial.location}
                {testimonial.dogName && ` · owns ${testimonial.dogName}`}
                {testimonial.placedYear && ` (${testimonial.placedYear})`}
              </figcaption>
            </figure>
          ) : (
            <CopySlot />
          )}

          <p className="mt-8">
            <Link
              href="/about/reviews"
              className="border-b border-brass pb-1 text-body text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
            >
              Read every placement
            </Link>
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- Labelled placeholders ---------------------------------------- */

function PhotoSlot() {
  return (
    <div className="flex aspect-[4/5] flex-col justify-between border border-dashed border-canvas/50 bg-ledger-deep p-5">
      <span className="eyebrow text-canvas">Photo slot</span>
      <span className="font-mono text-data text-canvas-deep">
        Owner&rsquo;s own photograph of the grown dog at home. 4:5. A phone
        picture is fine here and often reads as more honest than anything we
        would shoot.
      </span>
    </div>
  );
}

function CopySlot() {
  return (
    <div className="border-l-2 border-brass pl-6">
      <p className="eyebrow text-brass">
        {placeholderTestimonial.slotLabel} — awaiting copy
      </p>
      <p className="mt-4 font-display text-[clamp(1.5rem,2.4vw,2.125rem)] leading-[1.25] text-canvas">
        {placeholderTestimonial.guidance}
      </p>
      <p className="eyebrow mt-6 text-canvas-deep">
        Roughly {placeholderTestimonial.words} words · attribution and town
        below
      </p>
    </div>
  );
}
