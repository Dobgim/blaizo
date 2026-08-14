import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { HeroHeadline } from "@/components/motion/HeroHeadline";
import { AvailablePuppies } from "@/components/home/AvailablePuppies";
import { WhyThisKennel } from "@/components/home/WhyThisKennel";
import { MeetTheParents } from "@/components/home/MeetTheParents";
import { ProcessInBrief } from "@/components/home/ProcessInBrief";
import { PlacementQuote } from "@/components/home/PlacementQuote";
import { ReviewsWall } from "@/components/home/ReviewsWall";
import { ContactSection } from "@/components/home/ContactSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { images } from "@/lib/images";
import { siteConfig } from "@/lib/site-config";
import { localBusinessSchema } from "@/lib/schema";
import { placeholderDogs, placeholderPuppies } from "@/lib/placeholder-data";

/**
 * Step 3 builds the home page against hardcoded content. Step 5 swaps the
 * two arrays below for Supabase queries; nothing else on the page changes.
 *
 * The closing CTA is the one in the footer. It is the same invitation on
 * every page and repeating it here would be the site asking twice in a row.
 */
export default function HomePage() {
  const { contact } = siteConfig;

  return (
    <>
      <JsonLd data={localBusinessSchema()} />

      <section
        data-hero
        className="on-dark relative flex min-h-[92svh] items-end overflow-hidden bg-spruce"
      >
        <div data-hero-image className="absolute inset-0">
          <Image
            src={images["home-hero"].src}
            alt={images["home-hero"].alt}
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
                lines={[...siteConfig.heroHeadline]}
              />

              <p
                data-hero-trail
                className="measure mt-7 text-body-l text-ledger/85"
              >
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

      <AvailablePuppies puppies={placeholderPuppies} />
      <WhyThisKennel />
      <MeetTheParents dogs={placeholderDogs} />
      <ProcessInBrief />
      <PlacementQuote testimonial={null} />
      <ReviewsWall />
      <ContactSection />
    </>
  );
}
