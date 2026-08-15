import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PuppyCard } from "@/components/records/PuppyCard";
import { DataRows } from "@/components/records/DataRows";
import { ClearanceTable } from "@/components/records/ClearanceTable";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, dogSchema } from "@/lib/schema";
import { allPuppies, dogBySlug } from "@/lib/content-source";
import { getDogSlugs } from "@/lib/queries";
import { ageInYears, formatDate } from "@/lib/format";
import { Gallery } from "@/components/records/Gallery";

/* Re-read the database at most once a minute.

   Admin edits already call revalidatePath, so those appear instantly. This
   covers changes made outside the app — a row deleted in the Supabase SQL
   editor, say — which otherwise leave a prerendered page serving content that
   no longer exists. */
export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getDogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const dog = await dogBySlug(slug);
  if (!dog) return { title: "Dog not found" };

  const call = dog.callName ?? dog.name;
  return {
    title: `${call} — ${dog.role === "sire" ? "sire" : dog.role === "dam" ? "dam" : "retired"}`,
    description: `${call} (${dog.name}). ${dog.colour} ${dog.sex === "dog" ? "male" : "female"}, born ${formatDate(dog.dob)}. Hips, elbows, eyes and DNA panel results with certificates.`,
    openGraph: { images: [{ url: dog.heroImage }] },
  };
}

const ROLE_LABEL = {
  sire: "Sire",
  dam: "Dam",
  retired: "Retired",
  companion: "Companion",
} as const;

export default async function DogPage({ params }: Params) {
  const { slug } = await params;
  const dog = await dogBySlug(slug);
  if (!dog) notFound();

  const call = dog.callName ?? dog.name;
  /* Hero first, then the gallery, duplicates dropped. */
  const gallery = [
    { src: dog.heroImage, alt: dog.heroAlt },
    ...dog.gallery.map((src, i) => ({ src, alt: `${call}, photograph ${i + 2}` })),
  ].filter((img, i, all) => all.findIndex((o) => o.src === img.src) === i);

  const puppies = await allPuppies();
  const offspring = puppies.filter(
    (p) => p.sireName === call || p.damName === call,
  );

  return (
    <article>
      <JsonLd data={dogSchema(dog)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Our dogs", path: "/dogs" },
          { name: call, path: `/dogs/${dog.slug}` },
        ])}
      />

      <div className="shell pb-16 pt-32 lg:pt-44">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/dogs"
            className="eyebrow inline-flex min-h-11 items-center text-canvas-deep transition-colors duration-300 hover:text-foxred"
          >
            ← All dogs
          </Link>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p className="eyebrow text-canvas-deep">{ROLE_LABEL[dog.role]}</p>
            <h1 className="mt-3 text-display-l text-spruce">{call}</h1>
            <p className="mt-4 font-mono text-data text-canvas-deep">
              {dog.name}
            </p>
            <p className="measure mt-7 text-body-l text-spruce">{dog.bio}</p>

            <DataRows
              className="mt-9"
              rows={[
                { label: "Sex", value: dog.sex === "dog" ? "Male" : "Female" },
                { label: "Colour", value: dog.colour },
                {
                  label: "Born",
                  value: `${formatDate(dog.dob)} · ${ageInYears(dog.dob)} yrs`,
                },
                {
                  label: "Weight",
                  value: dog.weightLbs ? `${dog.weightLbs} lb` : "—",
                },
                { label: "Registry", value: dog.registryNumber ?? "—" },
              ]}
            />
          </div>

          {/* Portrait bleeds to the right edge — the asymmetry device again. */}
          <Reveal className="lg:col-span-6 lg:col-start-7">
            <div className="relative aspect-[4/5] overflow-hidden bg-canvas">
              <Image
                src={dog.heroImage}
                alt={dog.heroAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>

      {/* --- Clearances. The point of the page. --- */}
      <section
        aria-labelledby="clearances-heading"
        className="on-dark bg-spruce py-20 lg:py-28"
      >
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <p className="eyebrow text-brass-bright">Clearances</p>
            <h2 id="clearances-heading" className="mt-4 text-h2 text-ledger">
              The paperwork
            </h2>
          </div>

          <div className="lg:col-span-8 lg:col-start-5">
            <p className="measure text-body text-ledger/80">
              Every result here is transcribed from a certificate. You can
              verify the hip and elbow scores yourself on the OFA website using
              the registry number above — we would rather you did.
            </p>
            <div className="mt-8 [&_td]:text-ledger [&_th]:text-enamel [&_tr]:border-spruce-line">
              <ClearanceTable clearances={dog.clearances} />
            </div>
          </div>
        </div>
      </section>

      {/* --- Every photograph of this dog. --- */}
      {gallery.length > 1 && (
        <section aria-labelledby="dog-gallery-heading" className="shell py-20 lg:py-28">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="dog-gallery-heading" className="text-h2 text-spruce">
              More of {call}
            </h2>
            <p className="eyebrow text-canvas-deep">
              {String(gallery.length).padStart(2, "0")} photographs · tap to enlarge
            </p>
          </div>
          <div className="mt-8">
            <Gallery images={gallery} name={call} />
          </div>
        </section>
      )}

      {/* --- Offspring. --- */}
      {offspring.length > 0 && (
        <section aria-labelledby="offspring-heading" className="shell py-20 lg:py-28">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="offspring-heading" className="text-h2 text-spruce">
              Puppies out of {call}
            </h2>
            <p className="eyebrow text-canvas-deep">
              {String(offspring.length).padStart(2, "0")} on record
            </p>
          </div>

          <Reveal
            stagger
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {offspring.map((puppy) => (
              <PuppyCard
                key={puppy.id}
                puppy={puppy}
                sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 27vw"
              />
            ))}
          </Reveal>
        </section>
      )}
    </article>
  );
}
