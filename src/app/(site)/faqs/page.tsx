import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { getFaqsByCategory } from "@/lib/queries";
import { fallbackFaqs, type FaqGroup } from "@/lib/content/faqs";

export const metadata: Metadata = {
  title: "Questions people ask",
  description:
    "Health testing, applying, bringing a puppy home and what happens afterwards — answered plainly, including the awkward ones.",
};

export default async function FaqsPage() {
  const fromDb = await getFaqsByCategory();

  const groups: FaqGroup[] =
    fromDb.length > 0
      ? fromDb.map((g) => ({
          category: g.category,
          items: g.items.map((i) => ({ question: i.question, answer: i.answer })),
        }))
      : fallbackFaqs;

  /* FAQPage structured data. Built from exactly what is rendered below, so
     the markup and the schema can never disagree. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="FAQs"
        railNote={`${String(groups.length).padStart(2, "0")} groups`}
        title="Questions people ask"
        intro="Including the awkward ones. If something you want to know is not here, it is not because we would rather not answer it — ask us and we will add it."
      />

      <section className="shell pb-24 lg:pb-32">
        {groups.map((group) => (
          <div key={group.category} className="mb-14">
            <div className="grid gap-4 lg:grid-cols-12 lg:gap-8">
              <h2 className="eyebrow text-foxred lg:col-span-2 lg:pt-6">
                {group.category}
              </h2>

              <Reveal stagger className="hairline lg:col-span-8 lg:col-start-3">
                {group.items.map((item) => (
                  /* Native <details>. Open/close works with no JavaScript, is
                     keyboard operable for free, and is announced correctly. */
                  <details
                    key={item.question}
                    name={group.category}
                    className="group border-b border-enamel"
                  >
                    <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-5 text-h3 font-body font-semibold text-spruce transition-colors duration-300 hover:text-foxred [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <span
                        aria-hidden
                        className="mt-1 shrink-0 font-mono text-data text-brass transition-transform duration-300 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="measure pb-6 text-body text-canvas-deep">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </Reveal>
            </div>
          </div>
        ))}

        <div className="grid lg:grid-cols-12">
          <p className="lg:col-span-8 lg:col-start-3">
            <Link
              href="/contact"
              className="border-b border-brass pb-1 text-body-l text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
            >
              Ask us something that is not on this list
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
