import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What we collect when you apply for a puppy, what we do with it, and who else sees it. Short, because we collect very little.",
};

/**
 * PLACEHOLDER: the client should have this reviewed before launch. The facts
 * described are accurate to how the site is actually built — no analytics, no
 * payment processor, WhatsApp as the hand-off — so the review is about
 * jurisdiction and wording, not about correcting the substance.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        railNote="Privacy"
        title="What we do with your details"
        intro="Short, because we collect very little and sell none of it."
      />

      <section className="shell pb-24 lg:pb-32">
        <div className="grid lg:grid-cols-12">
          <div className="longform text-body text-spruce lg:col-span-8 lg:col-start-3">
            <h2>What we collect</h2>
            <p>
              Only what you type into the application form: your name, email,
              phone number, and your answers about your home and your
              experience with dogs. Nothing is collected in the background —
              there is no analytics package, no advertising pixel and no
              third-party tracker on this website.
            </p>

            <h2>No card details, ever</h2>
            <p>
              There is a checkout, but no card form and no payment processor.
              Every method we accept is a transfer you make from your own
              banking or payment app, so no card number, bank account number or
              payment token is ever entered here or stored by us. What we keep
              is the order: your name, contact details, the puppy and which
              method you said you would use. If a page claiming to be us ever
              asks you to type card details, or asks for a gift card, call{" "}
              <a href={siteConfig.contact.phoneHref}>
                {siteConfig.contact.phone}
              </a>{" "}
              and tell us.
            </p>

            <h2>Where it goes</h2>
            <p>
              Two places. A copy is stored in our own database so we have an
              inbox of applications, and a copy travels with you to WhatsApp as
              the message you send us. Sending that message means WhatsApp
              handles it under their own privacy terms, as it would with any
              message you send anybody.
            </p>
            <p>
              We use Supabase to host the database and Resend to send you a
              confirmation email. Both process the data on our behalf and
              neither uses it for anything else. Nobody else sees your
              application, and we do not sell, rent or share it.
            </p>

            <h2>How long we keep it</h2>
            <p>
              Applications we place a puppy from are kept for the life of the
              dog, because our return-to-breeder promise needs us to know where
              the dog went. Applications we do not act on are deleted after two
              years.
            </p>

            <h2>Your say</h2>
            <p>
              Ask us and we will send you everything we hold about you, correct
              anything wrong in it, or delete it. Write to{" "}
              <a href={`mailto:${siteConfig.contact.email}`}>
                {siteConfig.contact.email}
              </a>{" "}
              and we will do it within thirty days. You do not have to give a
              reason.
            </p>

            <h2>Cookies</h2>
            <p>
              The public site sets none. The admin area sets a single sign-in
              cookie for the kennel owner, which is not something a visitor
              will ever encounter.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
