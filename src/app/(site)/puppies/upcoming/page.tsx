import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { allLitters } from "@/lib/content-source";
import { formatMonth } from "@/lib/format";

export const metadata: Metadata = {
  title: "Upcoming litters",
  description:
    "Planned and expected Labrador litters at Golden Pup Kennel, with the pairing, the timing and what is still to be confirmed.",
};

export default async function UpcomingLittersPage() {
  const litters = await allLitters(["planned", "expected"]);

  return (
    <>
      <PageHeader
        eyebrow="Puppies"
        railNote="Upcoming"
        title="Litters we are planning"
        intro="A planned litter is exactly that — planned. Nothing here is guaranteed until a dam is confirmed in whelp, and we would rather list a pairing honestly than take deposits against a litter that may not happen."
      />

      <section className="shell pb-24 lg:pb-32">
        {litters.length > 0 ? (
          <Reveal stagger as="ul" className="hairline">
            {litters.map((litter) => (
              <li
                key={litter.id}
                className="grid gap-4 border-b border-enamel py-9 lg:grid-cols-12 lg:gap-8"
              >
                <div className="flex items-baseline gap-5 lg:col-span-2 lg:flex-col lg:items-start lg:gap-2">
                  <p className="font-mono text-data text-foxred">
                    {litter.code}
                  </p>
                  <p className="eyebrow text-canvas-deep">
                    {litter.status === "expected" ? "Expected" : "Planned"}
                  </p>
                </div>

                <div className="lg:col-span-6 lg:col-start-3">
                  <h2 className="text-h3 font-body font-semibold text-spruce">
                    {litter.sireName} × {litter.damName}
                  </h2>
                  <p className="measure mt-3 text-body text-canvas-deep">
                    {litter.notes}
                  </p>
                </div>

                <dl className="lg:col-span-3 lg:col-start-10">
                  <div className="flex items-baseline justify-between gap-4 border-t border-enamel py-1.5 lg:border-t-0">
                    <dt className="eyebrow text-canvas">Expected</dt>
                    <dd className="font-mono text-data text-spruce">
                      {formatMonth(litter.expectedOn)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-1.5">
                    <dt className="eyebrow text-canvas">Sire</dt>
                    <dd className="font-mono text-data text-spruce">
                      {litter.sireName}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-1.5">
                    <dt className="eyebrow text-canvas">Dam</dt>
                    <dd className="font-mono text-data text-spruce">
                      {litter.damName}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </Reveal>
        ) : (
          <EmptyState
            title="Nothing planned that we can talk about yet"
            body="We plan two or three litters a year and only announce a pairing once both dogs are cleared for it. Join the list and you will hear about the next one before it appears here."
            actionLabel="Join the waiting list"
            actionHref="/apply"
          />
        )}

        {litters.length > 0 && (
          <p className="mt-12">
            <Link
              href="/apply"
              className="border-b border-brass pb-1 text-body-l text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
            >
              Put your name down for one of these
            </Link>
          </p>
        )}
      </section>
    </>
  );
}
