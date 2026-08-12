import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Where the dogs live",
  description:
    "The whelping room, the boot room and the field. Photographs of where Ridgeline dogs actually spend their day, not a staged set.",
};

/**
 * Photo-led, as the brief requires. The copy is captions rather than prose —
 * on this page the photographs are the argument and the words only point at
 * what to notice in them.
 */
const ROOMS = [
  {
    key: "about-facility" as const,
    heading: "The whelping room",
    caption:
      "Off the sitting room, so somebody is always within earshot. Underfloor heat, a rail around the inside of the box so a dam cannot lie on a puppy against the wall, and a camera that we still do not rely on — for the first ten nights a person sleeps on the sofa two feet away.",
    wide: true,
  },
  {
    key: "home-whelping" as const,
    heading: "The boot room",
    caption:
      "Where wet dogs stop being wet. A door straight to the field, a drain in the floor, and the crates the puppies are fed in from five weeks so a crate is somewhere dinner happens rather than somewhere they are shut.",
    wide: false,
  },
  {
    key: "about-land" as const,
    heading: "The field and the pond",
    caption:
      "Rough cover, a steep bank they learn to negotiate, and water from April. The pond is where a Labrador stops being a theory. Puppies see it from six weeks, from the bank, on a lead, and they are not made to swim before they want to.",
    wide: false,
  },
  {
    key: "about-family" as const,
    heading: "The kitchen",
    caption:
      "An unreasonable number of dog beds, all of them occupied by the wrong dog. This is where the adults live, and it is the honest answer to where the dogs are kept.",
    wide: true,
  },
];

export default function FacilityPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        railNote="The facility"
        title="Where the dogs actually live"
        intro="These are our rooms, photographed as they are. If you want to see it in person, ask — and ask any other breeder you are talking to as well. The answer you get to that question tells you most of what you need to know."
      />

      <section className="shell pb-24 lg:pb-32">
        <div className="grid gap-x-8 gap-y-16 lg:grid-cols-12">
          {ROOMS.map((room, i) => (
            <Reveal
              key={room.key}
              className={
                room.wide
                  ? "lg:col-span-10 lg:col-start-3"
                  : i % 2 === 0
                    ? "lg:col-span-6 lg:col-start-3"
                    : "lg:col-span-5 lg:col-start-9"
              }
            >
              <figure>
                <div
                  className={[
                    "relative overflow-hidden bg-canvas",
                    room.wide ? "aspect-[16/9]" : "aspect-[4/5]",
                  ].join(" ")}
                >
                  <Image
                    src={images[room.key].src}
                    alt={images[room.key].alt}
                    fill
                    sizes={
                      room.wide
                        ? "(max-width: 1024px) 100vw, 70vw"
                        : "(max-width: 1024px) 100vw, 42vw"
                    }
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-5">
                  <h2 className="text-h3 font-display text-spruce">
                    {room.heading}
                  </h2>
                  <p className="measure mt-2.5 text-body text-canvas-deep">
                    {room.caption}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
