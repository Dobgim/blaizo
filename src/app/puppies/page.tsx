import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PuppyCard } from "@/components/records/PuppyCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { LitterFilterLinks } from "@/components/puppies/LitterFilterLinks";
import { puppiesByStatus } from "@/lib/content-source";

export const metadata: Metadata = {
  title: "Available puppies",
  description:
    "Labrador Retriever puppies looking for homes, with both parents cleared on hips, elbows, eyes and a full DNA panel. Every certificate published.",
};

const GRID_SIZES = "(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 27vw";

export default async function PuppiesPage() {
  const puppies = await puppiesByStatus(["available", "reserved"]);
  const available = puppies.filter((p) => p.status === "available");

  return (
    <>
      <PageHeader
        eyebrow="Puppies"
        railNote={`${String(available.length).padStart(2, "0")} available`}
        title="Puppies looking for homes"
        intro="Each card is the record we keep on that puppy. The rows are its litter, its parents, the day it was born and the day it can leave. Open one to read both parents' clearance certificates."
      />

      <section className="shell pb-24 lg:pb-32">
        {puppies.length > 0 ? (
          <>
            <LitterFilterLinks puppies={puppies} />
            <Reveal
              stagger
              className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {puppies.map((puppy, i) => (
                <PuppyCard
                  key={puppy.id}
                  puppy={puppy}
                  sizes={GRID_SIZES}
                  priority={i < 4}
                />
              ))}
            </Reveal>
          </>
        ) : (
          <EmptyState
            title="No puppies available right now"
            body="The next litters are already planned and the list is short. Put your name down and we will call you before a litter is listed publicly — most of ours are spoken for before they reach this page."
            actionLabel="Join the waiting list"
            actionHref="/apply"
          />
        )}
      </section>
    </>
  );
}
