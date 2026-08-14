import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { DogCard } from "@/components/records/PuppyCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { allDogs } from "@/lib/content-source";
import type { Dog } from "@/lib/types";

export const metadata: Metadata = {
  title: "Our dogs",
  description:
    "Every dog at Golden Pup Kennel — sires, dams and the retired ones who still live here. Clearances, registry numbers and certificates on each.",
};

type Filter = "all" | Dog["role"];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All dogs" },
  { key: "sire", label: "Sires" },
  { key: "dam", label: "Dams" },
  { key: "retired", label: "Retired" },
];

/**
 * Filtering is done with links and a search param rather than client state.
 * Each view is a real URL somebody can send to their spouse, it works with no
 * JavaScript, and the page stays a Server Component.
 */
export default async function DogsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const active: Filter =
    role === "sire" || role === "dam" || role === "retired" ? role : "all";

  const dogs = await allDogs(active === "all" ? undefined : active);

  return (
    <>
      <PageHeader
        eyebrow="The dogs"
        railNote={`${String(dogs.length).padStart(2, "0")} shown`}
        title="Every dog on the property"
        intro="The retired ones are here too. A kennel that shows you only the dogs it is currently breeding from is showing you half a picture, and the half it left out is usually the interesting one."
      />

      <section className="shell pb-24 lg:pb-32">
        <nav aria-label="Filter dogs by role">
          <ul className="hairline flex flex-wrap gap-x-8 gap-y-3 pt-5">
            {FILTERS.map((f) => {
              const isActive = f.key === active;
              return (
                <li key={f.key}>
                  <Link
                    href={f.key === "all" ? "/dogs" : `/dogs?role=${f.key}`}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "eyebrow pb-1 transition-colors duration-300",
                      isActive
                        ? "border-b-2 border-foxred text-foxred"
                        : "border-b-2 border-transparent text-canvas-deep hover:text-spruce",
                    ].join(" ")}
                  >
                    {f.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {dogs.length > 0 ? (
          <Reveal
            stagger
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {dogs.map((dog) => (
              <DogCard
                key={dog.id}
                dog={dog}
                sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 27vw"
              />
            ))}
          </Reveal>
        ) : (
          <EmptyState
            title="Nothing under that filter"
            body="We keep a small number of dogs on purpose — usually one sire and two or three dams. Try the full list, or read how we choose which dogs to breed from at all."
            actionLabel="See all the dogs"
            actionHref="/dogs"
          />
        )}
      </section>
    </>
  );
}
