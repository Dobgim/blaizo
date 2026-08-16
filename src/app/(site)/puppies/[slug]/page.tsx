import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { StatusSeal } from "@/components/records/StatusSeal";
import { AddToCartButton } from "@/components/shortlist/AddToCartButton";
import { Reveal } from "@/components/motion/Reveal";
import { DataRows } from "@/components/records/DataRows";
import { ClearanceTable } from "@/components/records/ClearanceTable";
import { parentsOf, puppyBySlug } from "@/lib/content-source";
import { getPuppySlugs } from "@/lib/queries";
import { formatDate, formatPrice } from "@/lib/format";
import { puppyEnquiryMessage } from "@/lib/whatsapp";
import { Gallery } from "@/components/records/Gallery";
import { siteConfig } from "@/lib/site-config";

/* Re-read the database at most once a minute.

   Admin edits already call revalidatePath, so those appear instantly. This
   covers changes made outside the app — a row deleted in the Supabase SQL
   editor, say — which otherwise leave a prerendered page serving content that
   no longer exists. */
export const revalidate = 60;

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

  /* Hero first, then the gallery, with duplicates dropped — the hero is
     routinely also the first gallery entry, and showing it twice makes the
     strip look padded. */
  const gallery = [
    { src: puppy.heroImage, alt: puppy.heroAlt },
    ...puppy.gallery.map((src, i) => ({
      src,
      alt: `${puppy.name}, photograph ${i + 2}`,
    })),
  ].filter((img, i, all) => all.findIndex((o) => o.src === img.src) === i);

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
              <>
                <ButtonLink
                  href={`/checkout?puppy=${puppy.slug}`}
                  size="lg"
                >
                  Order {puppy.name}
                </ButtonLink>
                {/* Same list as the heart on the cards, in the full-width form
                    this page has room for. */}
                <AddToCartButton
                  item={{
                    id: puppy.id,
                    slug: puppy.slug,
                    name: puppy.name,
                    kind: "puppy",
                    tag: `Litter ${puppy.litterId}`,
                    image: puppy.heroImage,
                    priceCents: puppy.priceCents,
                    /* Unconditionally true: this whole block only renders
                       for a puppy that is not placed. */
                    orderable: true,
                  }}
                />
                {/* WhatsApp is for questions, not ordering — hence the
                    outline treatment and the wording. */}
                <WhatsAppLink
                  message={puppyEnquiryMessage(puppy)}
                  className={buttonClasses("outline", "lg")}
                >
                  Ask a question on WhatsApp
                </WhatsAppLink>
              </>
            )}
            <ButtonLink href="/apply" variant="quiet" size="lg">
              Or start an application first
            </ButtonLink>
          </div>
          <p className="measure mt-4 text-small text-canvas-deep">
            Paid in full, with no deposit option. Nothing is charged on this
            website — you send payment yourself once we have sent you the
            details. Call or text {siteConfig.contact.phone} with any question
            before you order.
          </p>
        </div>
      </div>

      {/* --- Every photograph of this puppy. --- */}
      {gallery.length > 1 && (
        <section aria-labelledby="gallery-heading" className="hairline mt-20 pt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="gallery-heading" className="text-h2 text-spruce">
              More of {puppy.name}
            </h2>
            <p className="eyebrow text-canvas-deep">
              {String(gallery.length).padStart(2, "0")} photographs · tap to enlarge
            </p>
          </div>
          <div className="mt-8">
            <Gallery images={gallery} name={puppy.name} />
          </div>
        </section>
      )}

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
