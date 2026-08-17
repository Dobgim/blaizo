import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { puppyBySlug } from "@/lib/content-source";
import { siteConfig } from "@/lib/site-config";
import { formatPrice } from "@/lib/format";

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
  searchParams: Promise<{ puppy?: string; puppies?: string }>;
}) {
  const { puppy: single, puppies: many } = await searchParams;

  /* Two ways in, one shape out. `?puppy=` is the order button on a puppy's own
     page and predates the cart; `?puppies=a,b` is "order all" from the cart.
     Both are supported because the single-puppy link is the one people bookmark
     and send each other. */
  const slugs = (many ? many.split(",") : single ? [single] : [])
    .map((s) => s.trim())
    .filter(Boolean);

  const found = await Promise.all(slugs.map((s) => puppyBySlug(s)));
  const puppies = found.filter((p): p is NonNullable<typeof p> => p !== null);

  /* Asked for and not there at all — unpublished, deleted, or a stale link.
     Counted rather than ignored, because dropping a line from a two-puppy order
     without saying so leaves the buyer to notice the total changed by
     themselves. */
  const vanished = slugs.length - puppies.length;

  if (puppies.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Checkout"
          title="Choose a puppy first"
          intro="Every order is for one particular puppy, so the checkout needs to know which."
        />
        <section className="shell pb-24">
          <EmptyState
            title="No puppies selected"
            body="Open the puppy you want and use the order button on their page. That way the price and the paperwork match the dog."
            actionLabel="See the available puppies"
            actionHref="/puppies"
          />
        </section>
      </>
    );
  }

  const gone = puppies.filter((p) => p.status === "placed");
  const orderable = puppies.filter((p) => p.status !== "placed");

  /* Every puppy asked for has already gone. Nothing to order, so this is the
     dead end rather than a checkout with a warning on it. */
  if (orderable.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Checkout"
          title={
            gone.length === 1
              ? `${gone[0].name} has gone home`
              : "Those puppies have gone home"
          }
          intro="Already placed with families."
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

  const names = orderable.map((p) => p.name);
  const total = orderable.reduce((sum, p) => sum + p.priceCents, 0);

  return (
    <>
      <PageHeader
        eyebrow="Checkout"
        railNote={
          orderable.length > 1 ? `${orderable.length} puppies` : undefined
        }
        title={
          orderable.length === 1
            ? `Order ${names[0]}`
            : `Order ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
        }
        intro="Your details, how you would like to pay, and that is the order placed. Nothing is charged here — we call you with the payment details once we have your order."
      />

      <section className="shell pb-24 lg:pb-32">
        {/* One of several has gone in the time it took to reach checkout. The
            order carries on with the rest rather than throwing the whole thing
            away, but it has to be said out loud — otherwise the total silently
            drops and the buyer wonders what they did. */}
        {(gone.length > 0 || vanished > 0) && (
          <p
            role="alert"
            className="mb-8 border-l-2 border-foxred bg-ledger-bright px-4 py-3 text-small font-medium text-foxred"
          >
            {gone.length > 0 && (
              <>
                {gone.map((p) => p.name).join(" and ")}{" "}
                {gone.length === 1 ? "has" : "have"} just gone home, so{" "}
                {gone.length === 1 ? "that one is" : "those are"} not on this
                order.{" "}
              </>
            )}
            {vanished > 0 && (
              <>
                {vanished === 1 ? "One puppy" : `${vanished} puppies`} from your
                cart {vanished === 1 ? "is" : "are"} no longer listed and{" "}
                {vanished === 1 ? "has" : "have"} been left off.{" "}
              </>
            )}
            Everything below is still available — check the total before you
            place the order.
          </p>
        )}

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 lg:col-start-1">
            <CheckoutForm
              puppies={orderable.map((p) => ({
                slug: p.slug,
                name: p.name,
                priceCents: p.priceCents,
              }))}
              totalCents={total}
            />
          </div>

          {/* What you are buying, kept in view while you fill the form in. */}
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="border border-enamel bg-ledger-bright p-5">
              {orderable.map((puppy, i) => (
                <div
                  key={puppy.slug}
                  className={i > 0 ? "mt-6 border-t border-enamel pt-6" : ""}
                >
                  {/* Only the first gets the big portrait. Three full-height
                      photographs would push the form's total off the screen,
                      which is the one thing this panel exists to keep in view. */}
                  <div
                    className={`relative overflow-hidden bg-canvas ${
                      i === 0 ? "aspect-[4/5]" : "aspect-[16/9]"
                    }`}
                  >
                    <Image
                      src={puppy.heroImage}
                      alt={puppy.heroAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 24rem"
                      className="object-cover"
                    />
                  </div>

                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <h2 className="font-display text-h3 text-spruce">
                      {puppy.name}
                    </h2>
                    <p className="font-mono text-data text-spruce">
                      {puppy.priceCents > 0
                        ? formatPrice(puppy.priceCents)
                        : "Ask us"}
                    </p>
                  </div>

                  <dl className="hairline mt-4">
                    {[
                      {
                        label: "Sex",
                        value: puppy.sex === "dog" ? "Male" : "Female",
                      },
                      { label: "Colour", value: puppy.colour },
                      ...(puppy.ageLabel
                        ? [{ label: "Age", value: puppy.ageLabel }]
                        : []),
                    ].map((r) => (
                      <div
                        key={r.label}
                        className="flex items-baseline justify-between gap-4 border-b border-enamel py-2"
                      >
                        <dt className="eyebrow text-canvas">{r.label}</dt>
                        <dd className="font-mono text-data text-spruce">
                          {r.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}

              <p className="mt-5 text-small text-canvas-deep">
                Questions before you order? Call or text{" "}
                <a
                  href={siteConfig.contact.phoneHref}
                  className="text-spruce underline decoration-brass underline-offset-4 hover:text-foxred"
                >
                  {siteConfig.contact.phone}
                </a>
                {orderable.length === 1 && (
                  <>
                    , or{" "}
                    <Link
                      href={`/puppies/${orderable[0].slug}`}
                      className="text-spruce underline decoration-brass underline-offset-4 hover:text-foxred"
                    >
                      read {orderable[0].name}&rsquo;s full record
                    </Link>
                  </>
                )}
                .
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
