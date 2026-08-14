import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PuppyCard } from "@/components/records/PuppyCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { puppiesByStatus } from "@/lib/content-source";

export const metadata: Metadata = {
  title: "Past litters",
  description:
    "Every Golden Pup puppy we have placed, kept on the record. The archive is the proof — these are the dogs, and these are the families that have them.",
};

/**
 * The archive doubles as social proof, so it is deliberately not hidden away
 * or paginated into invisibility. A breeder who keeps the record of every dog
 * they have ever bred is making a different claim from one who shows you only
 * what is for sale this month.
 */
export default async function PastLittersPage() {
  const placed = await puppiesByStatus("placed");

  const byLitter = new Map<string, typeof placed>();
  for (const puppy of placed) {
    const bucket = byLitter.get(puppy.litterId);
    if (bucket) bucket.push(puppy);
    else byLitter.set(puppy.litterId, [puppy]);
  }

  return (
    <>
      <PageHeader
        eyebrow="Puppies"
        railNote="Archive"
        title="Every puppy we have placed"
        intro="We keep the record. Each of these went to a family we spoke to at length, and every one of them can come back to us at any age, for any reason, at no cost. That promise is only worth something if we can still tell you where the dogs are."
      />

      <section className="shell pb-24 lg:pb-32">
        {placed.length > 0 ? (
          [...byLitter].map(([code, puppies]) => (
            <div key={code} className="hairline mb-14 pt-6">
              <div className="flex items-baseline gap-5">
                <h2 className="font-mono text-data text-foxred">
                  Litter {code}
                </h2>
                <p className="eyebrow text-canvas-deep">
                  {String(puppies.length).padStart(2, "0")} placed
                </p>
              </div>
              <Reveal
                stagger
                className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {puppies.map((puppy) => (
                  <PuppyCard
                    key={puppy.id}
                    puppy={puppy}
                    sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 27vw"
                  />
                ))}
              </Reveal>
            </div>
          ))
        ) : (
          <EmptyState
            title="The archive starts with the current litters"
            body="Once this year's puppies are home with their families, their records move here and stay here. In the meantime, the dogs that produced them are worth your time."
            actionLabel="Meet the parents"
            actionHref="/dogs"
          />
        )}
      </section>
    </>
  );
}
