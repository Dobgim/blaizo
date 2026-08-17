import Link from "next/link";
import { PuppyCard } from "@/components/records/PuppyCard";
import { Reveal } from "@/components/motion/Reveal";
import type { Puppy } from "@/lib/types";

/**
 * The available puppies, three across.
 *
 * This was a rail that ran off the right edge — a nice gesture, and it meant
 * the fourth puppy onwards was behind a sideways scroll most visitors never
 * made. Three to a row shows the whole litter at once, on a phone as much as
 * on a desktop. The count still lives in the ledger rail rather than being
 * implied by how full the row looks.
 */
export function AvailablePuppies({ puppies }: { puppies: Puppy[] }) {
  const availableCount = puppies.filter((p) => p.status === "available").length;

  return (
    <section
      aria-labelledby="available-heading"
      className="shell py-20 lg:py-28"
    >
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="flex items-baseline gap-5 lg:col-span-2 lg:flex-col lg:items-start lg:gap-2">
          <p className="eyebrow text-canvas-deep">Available</p>
          <p className="font-mono text-numeral text-foxred">
            {String(availableCount).padStart(2, "0")}
          </p>
        </div>

        <div className="lg:col-span-8 lg:col-start-3">
          <h2 id="available-heading" className="text-h2 text-spruce">
            {availableCount > 0
              ? "Puppies looking for homes right now"
              : "No puppies available this minute"}
          </h2>
          <p className="measure mt-4 text-body text-canvas-deep">
            {availableCount > 0
              ? "Every one of these has both parents cleared on hips, elbows, eyes and a full DNA panel. Open a card to read the certificates."
              : "The next litters are already planned and the waiting list is short. Put your name down and we will call you before the litter is listed publicly."}
          </p>
        </div>
      </div>

      {puppies.length > 0 ? (
        <>
          {/* Three across at every width, including a phone. Was a rail that
              ran off the right edge, which said "there are more than fit" but
              hid most of the litter behind a sideways scroll nobody made. */}
          {/* Capped rather than filling the shell. Three columns across 1440px
              gives 424px cards — half again the size they were as a rail, and
              a section two thousand pixels tall. The cap keeps them near 330px
              and aligned under the heading. */}
          <Reveal
            stagger
            className="mt-12 grid max-w-[64rem] grid-cols-3 gap-2.5 sm:gap-5"
          >
            {puppies.map((puppy) => (
              <PuppyCard
                key={puppy.id}
                puppy={puppy}
                compact
                sizes="(max-width: 640px) 32vw, (max-width: 1024px) 31vw, 21rem"
              />
            ))}
          </Reveal>

          <p className="mt-6">
            <Link
              href="/puppies"
              className="border-b border-brass pb-1 text-body text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
            >
              All puppies and upcoming litters
            </Link>
          </p>
        </>
      ) : (
        <div className="mt-10 border-t border-enamel pt-8">
          <Link
            href="/apply"
            className="border-b border-brass pb-1 text-body-l text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
          >
            Join the waiting list
          </Link>
        </div>
      )}
    </section>
  );
}
