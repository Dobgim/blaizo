import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { puppyBySlug } from "@/lib/content-source";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Place your order and choose how you would like to pay.",
  robots: { index: false, follow: true },
};

/* Always fresh: a puppy reserved a minute ago must not still be orderable. */
export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ puppy?: string }>;
}) {
  const { puppy: slug } = await searchParams;
  const puppy = slug ? await puppyBySlug(slug) : null;

  if (!puppy) {
    return (
      <>
        <PageHeader
          eyebrow="Checkout"
          title="Choose a puppy first"
          intro="Every order is for one particular puppy, so the checkout needs to know which."
        />
        <section className="shell pb-24">
          <EmptyState
            title="No puppy selected"
            body="Open the puppy you want and use the order button on their page. That way the price and the paperwork match the dog."
            actionLabel="See the available puppies"
            actionHref="/puppies"
          />
        </section>
      </>
    );
  }

  if (puppy.status === "placed") {
    return (
      <>
        <PageHeader
          eyebrow="Checkout"
          title={`${puppy.name} has gone home`}
          intro="This one is already placed with a family."
        />
        <section className="shell pb-24">
          <EmptyState
            title="Still looking?"
            body="Call or text us and we will tell you what is available now and what is coming. Most of our puppies are spoken for before they reach the website."
            actionLabel="See what is available"
            actionHref="/puppies"
          />
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Checkout"
        railNote={`Litter ${puppy.litterId}`}
        title={`Order ${puppy.name}`}
        intro="Your details, how you would like to pay, and that is the order placed. Nothing is charged here — we call you with the payment details once we have your order."
      />

      <section className="shell pb-24 lg:pb-32">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 lg:col-start-1">
            <CheckoutForm
              puppySlug={puppy.slug}
              puppyName={puppy.name}
              amountCents={puppy.priceCents}
            />
          </div>

          {/* What you are buying, kept in view while you fill the form in. */}
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="border border-enamel bg-ledger-bright p-5">
              <div className="relative aspect-[4/5] overflow-hidden bg-canvas">
                <Image
                  src={puppy.heroImage}
                  alt={puppy.heroAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 24rem"
                  className="object-cover"
                />
              </div>

              <h2 className="mt-4 font-display text-h3 text-spruce">
                {puppy.name}
              </h2>

              <dl className="hairline mt-4">
                {[
                  { label: "Sex", value: puppy.sex === "dog" ? "Male" : "Female" },
                  { label: "Colour", value: puppy.colour },
                  { label: "Collar", value: puppy.collarColour },
                  { label: "Dam", value: puppy.damName },
                  { label: "Ready", value: formatDate(puppy.readyOn) },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="flex items-baseline justify-between gap-4 border-b border-enamel py-2"
                  >
                    <dt className="eyebrow text-canvas">{r.label}</dt>
                    <dd className="font-mono text-data text-spruce">{r.value}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-5 text-small text-canvas-deep">
                Questions before you order? Call or text{" "}
                <a
                  href={siteConfig.contact.phoneHref}
                  className="text-spruce underline decoration-brass underline-offset-4 hover:text-foxred"
                >
                  {siteConfig.contact.phone}
                </a>
                , or{" "}
                <Link
                  href={`/puppies/${puppy.slug}`}
                  className="text-spruce underline decoration-brass underline-offset-4 hover:text-foxred"
                >
                  read {puppy.name}&rsquo;s full record
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
