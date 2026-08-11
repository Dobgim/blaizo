import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { processPages } from "@/lib/content/process";

export const metadata: Metadata = {
  title: "How we do it",
  description:
    "From choosing a pairing to a puppy asleep in your kitchen: the breeding program, the health testing, the early training, the guarantee and going home.",
};

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Process"
        railNote="05 steps"
        title="From a pairing on paper to a dog asleep in your kitchen"
        intro="Five stages, in the order they actually happen. The second one is the one to read twice — it is the difference between a well-bred Labrador and an expensive gamble, and it is where most of the questions we get come from."
      />

      <section className="shell pb-24 lg:pb-32">
        <Reveal stagger as="ol" className="hairline">
          {processPages.map((page) => (
            <li key={page.slug} className="border-b border-enamel">
              <Link
                href={`/process/${page.slug}`}
                className="group grid gap-3 py-9 transition-colors duration-300 lg:grid-cols-12 lg:gap-8"
              >
                <span className="font-mono text-data text-foxred lg:col-span-2">
                  {page.n}
                </span>
                <span className="lg:col-span-6 lg:col-start-3">
                  <span className="block font-display text-h3 text-spruce transition-colors duration-300 group-hover:text-foxred">
                    {page.title}
                  </span>
                  <span className="measure mt-2 block text-body text-canvas-deep">
                    {page.summary}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="eyebrow self-start text-canvas transition-transform duration-300 group-hover:translate-x-2 lg:col-span-2 lg:col-start-11 lg:text-right"
                >
                  Read →
                </span>
              </Link>
            </li>
          ))}
        </Reveal>
      </section>
    </>
  );
}
