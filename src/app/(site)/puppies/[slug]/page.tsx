import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { StatusSeal } from "@/components/records/StatusSeal";
import { Reveal } from "@/components/motion/Reveal";
import { DataRows } from "@/components/records/DataRows";
import { ClearanceTable } from "@/components/records/ClearanceTable";
import { parentsOf, puppyBySlug } from "@/lib/content-source";
import { getPuppySlugs } from "@/lib/queries";
import { formatDate, formatPrice } from "@/lib/format";
import { puppyEnquiryMessage } from "@/lib/whatsapp";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPuppySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const puppy = await puppyBySlug(slug);
  if (!puppy) return { title: "Puppy not found" };

  return {
    title: `${puppy.name} — ${puppy.colour} ${puppy.sex === "dog" ? "male" : "female"}`,
    description: `${puppy.name}, a ${puppy.colour.toLowerCase()} ${puppy.sex === "dog" ? "male" : "female"} from litter ${puppy.litterId} out of ${puppy.damName} by ${puppy.sireName}. Both parents fully health tested.`,
    openGraph: { images: [{ url: puppy.heroImage }] },
  };
}

const STATUS_NOTE: Record<string, string> = {
  available: "Available. Nothing is paid on this website — send us a message and we will talk.",
  reserved:
    "Reserved for a family we are already talking to. Deposits fall through sometimes, so it is worth asking.",
  placed: "Placed. Kept here as part of the record.",
};

export default async function PuppyPage({ params }: Params) {
  const { slug } = await params;
  const puppy = await puppyBySlug(slug);
  if (!puppy) notFound();

  const { sire, dam } = await parentsOf(puppy);

  return (
    <article className="shell pb-24 pt-32 lg:pb-32 lg:pt-44">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/puppies"
          className="eyebrow inline-flex min-h-11 items-center text-canvas-deep transition-colors duration-300 hover:text-foxred"
        >
          ← All puppies
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        {/* --- The photograph. Largest thing on the page, as it should be. --- */}
        <Reveal className="lg:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden bg-canvas sm:aspect-[4/3] lg:aspect-[4/5]">
            <Image
              src={puppy.heroImage}
              alt={puppy.heroAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        {/* --- The record. --- */}
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="eyebrow text-canvas-deep">Litter {puppy.litterId}</p>
          <h1 className="mt-3 text-display-l text-spruce">{puppy.name}</h1>

          <div className="mt-6 flex items-center gap-5">
            <StatusSeal status={puppy.status} />
            <p className="text-small text-canvas-deep">
              {puppy.priceCents > 0 ? formatPrice(puppy.priceCents) : "Ask us"}
            </p>
          </div>

          <p className="measure mt-6 text-body text-canvas-deep">
            {STATUS_NOTE[puppy.status]}
          </p>

          <DataRows
            className="mt-8"
            rows={[
              { label: "Sex", value: puppy.sex === "dog" ? "Male" : "Female" },
              { label: "Colour", value: puppy.colour },
              { label: "Collar", value: puppy.collarColour },
              { label: "Sire", value: puppy.sireName },
              { label: "Dam", value: puppy.damName },
              { label: "Born", value: formatDate(puppy.bornOn) },
              { label: "Ready", value: formatDate(puppy.readyOn) },
            ]}
          />

          {puppy.notes && (
            <p className="measure mt-8 text-body text-spruce">{puppy.notes}</p>
          )}

          <div className="mt-10 flex flex-col gap-3">
            {puppy.status !== "placed" && (
              <WhatsAppLink
                message={puppyEnquiryMessage(puppy)}
                className={buttonClasses("solid", "lg")}
              >
                Ask about {puppy.name}
              </WhatsAppLink>
            )}
            <ButtonLink href="/apply" variant="outline" size="lg">
              Start an application
            </ButtonLink>
          </div>
          <p className="mt-4 text-small text-canvas-deep">
            No payment is taken on this site.
          </p>
        </div>
      </div>

      {/* --- The parents. The reason to trust any of the above. --- */}
      {(sire || dam) && (
        <section aria-labelledby="parents-heading" className="hairline mt-20 pt-12">
          <h2 id="parents-heading" className="text-h2 text-spruce">
            Both parents, and their paperwork
          </h2>
          <p className="measure mt-4 text-body text-canvas-deep">
            Every result below is transcribed from a certificate you can look up
            yourself using the registry number on each dog&rsquo;s page.
          </p>

          <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
            {[sire, dam].filter(Boolean).map((parent) => (
              <div key={parent!.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-h3 font-display text-spruce">
                    <Link
                      href={`/dogs/${parent!.slug}`}
                      className="border-b border-brass pb-1 transition-colors duration-300 hover:border-foxred hover:text-foxred"
                    >
                      {parent!.callName ?? parent!.name}
                    </Link>
                  </h3>
                  <p className="eyebrow text-canvas-deep">
                    {parent!.role === "sire" ? "Sire" : "Dam"}
                  </p>
                </div>
                <ClearanceTable
                  className="mt-5"
                  clearances={parent!.clearances}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
