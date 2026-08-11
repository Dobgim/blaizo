import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { images } from "@/lib/images";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "The family",
  description:
    "Who we are, where we are, and why a small kennel in the Vermont hills breeds two or three litters a year and no more.",
};

/**
 * Deliberately not numbered. The About page is not a sequence — it is a place,
 * a family and a set of reasons — so the numbering device the process pages
 * use would be decoration here rather than information.
 */
export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        railNote={`Est. ${siteConfig.establishedYear}`}
        title="A small kennel that has stayed small on purpose"
        intro="We are a family, on a hill farm, with a handful of dogs that live in our house. That sentence contains the entire business model, and every decision on this site follows from it."
      />

      {/* --- The land. Full-bleed photograph, parallax. --- */}
      <section className="relative h-[55vh] min-h-[380px] overflow-hidden bg-canvas lg:h-[70vh]">
        <Parallax className="absolute inset-0 -bottom-16">
          <Image
            src={images["about-land"].src}
            alt={images["about-land"].alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </Parallax>
      </section>

      <section className="shell py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <p className="eyebrow text-canvas-deep">The place</p>
          </div>
          <div className="longform text-body text-spruce lg:col-span-8 lg:col-start-5">
            <p className="text-body-l">
              Ninety acres of hill pasture and hardwood, most of it too steep to
              do anything useful with, which is exactly what makes it good for
              dogs. There is a pond they swim in from April, a stretch of rough
              cover we train in, and a kitchen with an unreasonable number of
              beds in it.
            </p>
            <p>
              The dogs are not kennelled. There is a whelping room off the
              sitting room and a boot room with a door to the field, and that is
              the extent of the facility — everything else is just our house.
              You are welcome to come and see it, and we would encourage you to
              ask any breeder for the same.
            </p>
            <p>
              <Link href="/about/facility">
                Look around where the dogs actually live
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* --- Why small. --- */}
      <section className="on-dark bg-spruce py-20 lg:py-28">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <p className="eyebrow text-brass-bright">Why we stay small</p>
          </div>
          <Reveal stagger className="lg:col-span-8 lg:col-start-5">
            <h2 className="text-h2 text-ledger">
              Two or three litters a year is not a limitation we are apologising
              for
            </h2>
            <p className="measure mt-6 text-body text-ledger/80">
              It is the reason we can tell you what every dog we have bred is
              doing now. It is the reason somebody sleeps next to the whelping
              box for ten nights instead of watching a camera. It is the reason
              we can afford to skip a season when an eye examination comes back
              looking slightly wrong, and it is the reason we can promise to
              take any dog back at any age — a promise that is easy to make and
              expensive to keep, and only possible at this scale.
            </p>
            <p className="measure mt-5 text-body text-ledger/80">
              It also means we say no often, and sometimes to people who would
              have been fine. If that happens to you, ask us for two other
              names. We will have them.
            </p>
          </Reveal>
        </div>
      </section>

      {/* --- The people. --- */}
      <section aria-labelledby="team-heading" className="shell py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <p className="eyebrow text-canvas-deep">Who you will deal with</p>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <h2 id="team-heading" className="text-h2 text-spruce">
              The whole team is the family
            </h2>

            <dl className="hairline mt-8">
              {[
                {
                  role: "Breeding, health testing, and every phone call",
                  note: "PLACEHOLDER — the client to supply names, and one honest sentence each about what they actually do. Written as a person, not a bio.",
                },
                {
                  role: "Whelping and the first eight weeks",
                  note: "PLACEHOLDER — client to supply.",
                },
                {
                  role: "Gundog training and the field work",
                  note: "PLACEHOLDER — client to supply.",
                },
                {
                  role: "Veterinary care",
                  note: "PLACEHOLDER — practice name and town. Naming your vet is a small thing that separates you from a puppy mill.",
                },
              ].map((row) => (
                <div key={row.role} className="border-b border-enamel py-5">
                  <dt className="text-h3 font-body font-semibold text-spruce">
                    {row.role}
                  </dt>
                  <dd className="measure mt-2 text-body text-canvas-deep">
                    {row.note}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
