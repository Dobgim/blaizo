import Link from "next/link";
import { PuppyCard } from "@/components/records/PuppyCard";
import { Reveal } from "@/components/motion/Reveal";
import type { Puppy } from "@/lib/types";

/**
 * The available strip.
 *
 * Runs off the right edge on purpose — you can see there are more than fit,
 * which is the thing a tidy three-up grid cannot say. The count lives in the
 * ledger rail rather than being implied by how full the row looks.
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
          <p className="font-mono text-[2.5rem] leading-none text-foxred">
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
          {/* Negative right margin runs the rail to the viewport edge. */}
          <Reveal
            stagger
            className="mt-12 flex gap-5 overflow-x-auto pb-5 -mr-5 pr-5 md:-mr-10 md:pr-10 xl:-mr-16 xl:pr-16"
          >
            {puppies.map((puppy) => (
              <div key={puppy.id} className="w-[78vw] max-w-[320px] shrink-0 sm:w-[300px]">
                <PuppyCard puppy={puppy} />
              </div>
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
