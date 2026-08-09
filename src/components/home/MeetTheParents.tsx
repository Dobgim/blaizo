import Link from "next/link";
import { RecordCard } from "@/components/records/RecordCard";
import { Reveal } from "@/components/motion/Reveal";
import { Marquee } from "@/components/motion/Marquee";
import { formatMonth } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { Dog } from "@/lib/types";

const clearanceRow = (dog: Dog, type: string) =>
  dog.clearances.find((c) => c.type === type)?.result ?? "Pending";

/**
 * The parents, on the site's one dark band, as record cards.
 *
 * Cards are stepped down the row rather than sitting on a shared baseline —
 * a set of cards laid on a desk, not a grid of tiles.
 */
export function MeetTheParents({ dogs }: { dogs: Dog[] }) {
  return (
    <section
      aria-labelledby="parents-heading"
      className="on-dark bg-spruce py-20 lg:py-28"
    >
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12">
          <p className="eyebrow text-brass-bright lg:col-span-2">The parents</p>
          <div className="lg:col-span-7 lg:col-start-3">
            <h2 id="parents-heading" className="text-h2 text-ledger">
              You will meet every one of them before you decide
            </h2>
            <p className="measure mt-4 text-body text-enamel">
              These are the dogs that live in our house. Their clearances are
              on their own pages, with the certificates attached and the dates
              they were taken.
            </p>
          </div>
        </div>

        <Reveal
          stagger
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {dogs.map((dog, i) => (
            <div
              key={dog.id}
              className={i === 1 ? "lg:mt-14" : i === 2 ? "lg:mt-7" : undefined}
            >
              <RecordCard
                onDark
                href={`/dogs/${dog.slug}`}
                name={dog.callName ?? dog.name}
                tag={dog.role === "sire" ? "SIRE" : "DAM"}
                meta={`${dog.colour} · b. ${formatMonth(dog.dob)}`}
                image={dog.heroImage}
                imageAlt={dog.heroAlt}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                rows={[
                  { label: "Reg", value: dog.registryNumber ?? "—" },
                  { label: "Hips", value: clearanceRow(dog, "Hips") },
                  { label: "Elbows", value: clearanceRow(dog, "Elbows") },
                  { label: "Eyes", value: clearanceRow(dog, "Eyes") },
                  { label: "DNA", value: clearanceRow(dog, "DNA") },
                ]}
              />
            </div>
          ))}
        </Reveal>

        <p className="mt-12">
          <Link
            href="/dogs"
            className="border-b border-brass-bright pb-1 text-body text-ledger transition-colors duration-300 hover:border-ledger hover:text-brass-bright"
          >
            Every dog we own, including the retired ones
          </Link>
        </p>
      </div>

      <div className="mt-16 border-y border-spruce-line">
        <h2 className="sr-only">Health clearances and registries</h2>
        <Marquee items={siteConfig.registries} />
      </div>
    </section>
  );
}
