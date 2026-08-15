import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Order placed",
  robots: { index: false, follow: false },
};

/**
 * Where Web3Forms sends the buyer back to after the order notification.
 *
 * A separate page rather than a state inside the form, because the order is
 * submitted by a real form navigation: the browser leaves this site, posts to
 * Web3Forms, and is redirected here. That route is used precisely because it
 * involves no CORS and lets the browser clear a Cloudflare challenge on the
 * way through, which a fetch cannot do.
 *
 * Everything shown here comes from the query string, so it is presentational
 * only — the order itself was already recorded server-side before the
 * redirect, and this page never writes anything.
 */
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; puppy?: string }>;
}) {
  const { ref, puppy } = await searchParams;

  return (
    <>
      <PageHeader
        eyebrow="Order placed"
        railNote={ref ? ref : undefined}
        title="Thank you. We will get back to you with the payment details."
        intro={
          puppy
            ? `Your order for ${puppy} is with us.`
            : "Your order is with us."
        }
      />

      <section className="shell pb-24 lg:pb-32">
        <div className="grid lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-1">
            <div className="border border-enamel bg-ledger-bright p-7">
              {ref && (
                <>
                  <p className="eyebrow text-canvas-deep">Your order number</p>
                  <p className="mt-2 font-mono text-h2 text-foxred">{ref}</p>
                </>
              )}

              <p className="measure mt-6 text-body text-canvas-deep">
                We will call you on the number you gave, usually the same day,
                to talk it through and send you video of your puppy. The
                payment details come from us on that call.
              </p>

              <p className="measure mt-4 text-body text-canvas-deep">
                Nothing has been charged and there is nothing to pay yet.
                Please do not send any money until you have spoken to us.
              </p>

              <p className="measure mt-6 border-l-2 border-brass pl-4 text-small text-canvas-deep">
                We will only ever give you payment details by phone, or in a
                message after we have spoken. If anything claiming to be us
                sends you payment details out of the blue, it is not us — call{" "}
                <a
                  href={siteConfig.contact.phoneHref}
                  className="text-spruce underline decoration-brass underline-offset-4 hover:text-foxred"
                >
                  {siteConfig.contact.phone}
                </a>
                .
              </p>

              <p className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                <Link
                  href="/puppies"
                  className="border-b border-brass pb-1 text-body text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
                >
                  Back to the puppies
                </Link>
                <a
                  href={siteConfig.contact.phoneHref}
                  className="border-b border-brass pb-1 text-body text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
                >
                  Call or text us now
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
