import Image from "next/image";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { images } from "@/lib/images";
import { reasons } from "@/lib/placeholder-data";

/**
 * Four claims separated by brass hairlines, against one large photograph
 * bleeding off the right edge.
 *
 * No icons. A kennel that photographs well has no business explaining itself
 * with pictograms in rounded squares.
 */
export function WhyThisKennel() {
  return (
    <section
      aria-labelledby="why-heading"
      className="relative overflow-hidden bg-ledger-deep py-20 lg:py-28"
    >
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <p className="eyebrow text-canvas-deep">Why people drive six hours</p>

            <Reveal stagger as="dl" className="mt-9">
              {reasons.map((reason) => (
                <div
                  key={reason.title}
                  className="border-t border-enamel py-7 first:border-t-0 first:pt-0"
                >
                  <dt className="font-display text-h3 text-spruce">
                    {reason.title}
                  </dt>
                  <dd className="measure mt-3 text-body text-canvas-deep">
                    {reason.body}
                  </dd>
                </div>
              ))}
            </Reveal>
          </div>

          {/* Bleeds off the right edge rather than sitting in a tidy column. */}
          <div className="relative min-h-[420px] lg:col-span-5 lg:col-start-8 lg:min-h-[640px]">
            <div className="absolute inset-y-0 left-0 w-screen max-w-none overflow-hidden lg:w-[50vw]">
              {/* Over-sized so 60px of drift never exposes an edge. */}
              <Parallax className="absolute -top-[70px] h-[calc(100%+140px)] w-full">
                <div className="relative h-full w-full">
                  <Image
                    src={images["home-whelping"].src}
                    alt={images["home-whelping"].alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </Parallax>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
