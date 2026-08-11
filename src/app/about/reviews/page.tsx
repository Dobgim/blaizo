import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { getTestimonials } from "@/lib/queries";
import { placeholderTestimonial } from "@/lib/placeholder-data";

export const metadata: Metadata = {
  title: "Placements",
  description:
    "What the families who have our dogs say about them, in their own words.",
};

/**
 * The wall.
 *
 * If the client has supplied no testimonials, this page shows the labelled
 * slot rather than invented quotes. Fabricated endorsements with invented
 * names are the precise thing an anxious buyer is scanning for, and one
 * plausible-looking fake would undo every honest thing on the rest of the site.
 */
export default async function ReviewsPage() {
  const testimonials = await getTestimonials();

  return (
    <>
      <PageHeader
        eyebrow="About"
        railNote={
          testimonials.length > 0
            ? `${String(testimonials.length).padStart(2, "0")} letters`
            : "Awaiting copy"
        }
        title="What the families say"
        intro="We ask owners the same question after two years: what surprised you? Surprise is the detail that reads as true, and it is more useful to you than another sentence about how happy somebody is."
      />

      <section className="shell pb-24 lg:pb-32">
        {testimonials.length > 0 ? (
          <Reveal stagger className="grid gap-x-8 gap-y-14 lg:grid-cols-12">
            {testimonials.map((t, i) => (
              <figure
                key={t.id}
                className={
                  i % 3 === 0
                    ? "lg:col-span-7 lg:col-start-1"
                    : i % 3 === 1
                      ? "lg:col-span-5 lg:col-start-8"
                      : "lg:col-span-6 lg:col-start-4"
                }
              >
                <blockquote className="border-l-2 border-brass pl-6 text-body-l text-spruce">
                  {t.quote}
                </blockquote>
                <figcaption className="eyebrow mt-4 pl-6 text-canvas-deep">
                  {t.authorName}
                  {t.location ? ` · ${t.location}` : ""}
                  {t.dogName ? ` · owns ${t.dogName}` : ""}
                  {t.placedYear ? ` (${t.placedYear})` : ""}
                </figcaption>
              </figure>
            ))}
          </Reveal>
        ) : (
          <>
            <div className="grid lg:grid-cols-12">
              <div className="border border-dashed border-canvas p-8 lg:col-span-8 lg:col-start-3">
                <p className="eyebrow text-foxred">
                  Placeholder · {placeholderTestimonial.slotLabel}
                </p>
                <p className="measure mt-4 text-body text-spruce">
                  {placeholderTestimonial.guidance}
                </p>
                <p className="eyebrow mt-6 text-canvas-deep">
                  Around {placeholderTestimonial.words} words each · six to
                  eight of them fills this page
                </p>
              </div>
            </div>
            <EmptyState
              title="No invented reviews will appear here"
              body="This page stays as a labelled placeholder until real owners send real words. Anything else would be the one dishonest thing on an otherwise honest site, and it is exactly what a careful buyer is looking for."
              actionLabel="Read how we test instead"
              actionHref="/process/health-testing"
            />
          </>
        )}
      </section>
    </>
  );
}
