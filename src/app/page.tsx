import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { HeroHeadline } from "@/components/motion/HeroHeadline";
import { Reveal } from "@/components/motion/Reveal";
import { Marquee } from "@/components/motion/Marquee";
import { images } from "@/lib/images";
import { siteConfig } from "@/lib/site-config";

/**
 * Step 1 of the build: the hero exists so the layout shell, the header's
 * transparent-over-photograph state and the type scale can be judged against
 * real content. The remaining home page sections arrive in step 3.
 */
export default function HomePage() {
  const { contact } = siteConfig;

  return (
    <>
      <section
        data-hero
        className="on-dark relative flex min-h-[92svh] items-end overflow-hidden bg-spruce"
      >
        <div data-hero-image className="absolute inset-0">
          <Image
            src={images.home.hero.url}
            alt={images.home.hero.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Scrim. Heavier at the foot, where the headline sits. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-spruce via-spruce/45 to-spruce/10"
        />
        {/* A second scrim under the header, so nav contrast never depends on
            what the photograph happens to be doing at the top of the frame. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-spruce/75 to-transparent"
        />

        <div className="shell relative w-full pb-16 pt-32 lg:pb-24">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* The ledger rail — mono metadata, the site's organising device. */}
            <div
              data-hero-trail
              className="flex gap-6 lg:col-span-2 lg:flex-col lg:gap-3"
            >
              <p className="eyebrow text-brass-bright">
                Est. {siteConfig.establishedYear}
              </p>
              <p className="eyebrow text-ledger/70">
                {contact.lat.toFixed(1)}°N {Math.abs(contact.lng).toFixed(1)}°W
              </p>
            </div>

            <div className="lg:col-span-8 lg:col-start-3">
              <HeroHeadline
                className="text-display-xl text-ledger"
                lines={[
                  "Eight litters a year.",
                  "Every one of them",
                  "accounted for.",
                ]}
              />

              <p data-hero-trail className="measure mt-7 text-body-l text-ledger/85">
                A family kennel in the Vermont hills raising {siteConfig.breed}s
                for shooting, for service work, and for families who want a dog
                that settles. Both parents cleared on hips, elbows, eyes and a
                full DNA panel, with every certificate published on this site.
              </p>

              <div
                data-hero-trail
                className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <ButtonLink href="/puppies" variant="onDark" size="lg">
                  See available puppies
                </ButtonLink>
                <ButtonLink
                  href="/process/health-testing"
                  className="border border-ledger/40 text-ledger hover:bg-ledger hover:text-spruce"
                  size="lg"
                >
                  How we test
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-20 lg:py-28">
        <Reveal stagger className="grid gap-10 lg:grid-cols-12">
          <p className="eyebrow text-canvas-deep lg:col-span-2">The kennel</p>
          <div className="lg:col-span-8 lg:col-start-3">
            <p className="measure text-body-l text-spruce">
              We keep six dogs. You can meet all of them, and you will meet the
              mother of your puppy before you take it home — in the house she
              lives in, not in a car park. If a breeder will not let you do
              that, walk away from them.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="on-dark bg-spruce" aria-label="Health clearances and registries">
        <Marquee items={siteConfig.registries} />
      </section>
    </>
  );
}
