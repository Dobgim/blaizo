import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms of using this website, and how they relate to the contract you would actually sign for a puppy.",
};

/**
 * PLACEHOLDER: client's attorney to review before launch.
 *
 * The important point this page makes is the separation — the website's terms
 * are not the puppy contract, and nothing here creates an obligation to sell
 * anybody a dog. That distinction protects the buyer as much as the kennel.
 */
export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        railNote="Terms"
        title="Terms of use"
        intro="These cover the website. The contract that matters is the one you would sign for a puppy, and it is a different document."
      />

      <section className="shell pb-24 lg:pb-32">
        <div className="grid lg:grid-cols-12">
          <div className="longform text-body text-spruce lg:col-span-8 lg:col-start-3">
            <h2>This site is not a shop</h2>
            <p>
              Nothing here can be bought. There is no checkout and no payment is
              taken at any point. Submitting an application is a request to
              start a conversation — it does not reserve a puppy, it does not
              create a contract, and it does not oblige us to sell you a dog.
              Equally, it does not oblige you to buy one.
            </p>

            <h2>The puppy contract is separate</h2>
            <p>
              If we agree to place a puppy with you, you will sign a separate
              written agreement covering the price, the deposit, the{" "}
              <Link href="/process/guarantee">health guarantee</Link>, the
              spay/neuter terms and the return-to-breeder clause. That document
              governs the sale. Nothing on this website overrides it, and
              nothing on this website is a substitute for reading it.
            </p>

            <h2>Accuracy</h2>
            <p>
              We keep the dogs&rsquo; details, clearance results and litter
              information as current as we can, and every clearance is
              transcribed from a certificate. Mistakes are still possible. If
              something matters to your decision, ask us to show you the
              certificate — you can also verify hip and elbow results yourself
              on the OFA website using the registry numbers we publish.
            </p>
            <p>
              Availability changes quickly. A puppy shown as available may be
              reserved by the time you read the page.
            </p>

            <h2>Photographs and text</h2>
            <p>
              The photographs and writing on this site belong to{" "}
              {siteConfig.name}. Please do not reuse them to advertise other
              dogs — it happens more than you would think, and it is one of the
              ways puppy scams are run.
            </p>

            <h2>Scams</h2>
            <p>
              We will never ask for payment by gift card, cryptocurrency or wire
              transfer, and we will never ask for money before speaking to you.
              If someone using our name and our photographs asks you for any of
              those things, call{" "}
              <a href={siteConfig.contact.phoneHref}>
                {siteConfig.contact.phone}
              </a>
              . We would much rather hear about it.
            </p>

            <h2>Getting in touch</h2>
            <p>
              Questions about any of this go to{" "}
              <a href={`mailto:${siteConfig.contact.email}`}>
                {siteConfig.contact.email}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
