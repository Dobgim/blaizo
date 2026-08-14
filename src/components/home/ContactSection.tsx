import Link from "next/link";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/lib/site-config";
import { generalEnquiryMessage } from "@/lib/whatsapp";

const { contact } = siteConfig;

/**
 * The home page's closing band: how to reach a person, and how to apply.
 *
 * This replaces the generic footer invitation on the home page rather than
 * sitting above it — a visitor who has read the whole page should be asked
 * once, in one place, with the actual phone number in front of them. See
 * ClosingInvitation, which suppresses itself here for that reason.
 *
 * Spruce ground because it is a closing statement, and because the home page
 * is allowed exactly two dark bands: this and Meet the parents.
 */
export function ContactSection() {
  const mapQuery = encodeURIComponent(
    `${contact.addressLine}, ${contact.locality}, ${contact.region} ${contact.postalCode}`,
  );

  return (
    <section
      aria-labelledby="home-contact-heading"
      className="on-dark bg-spruce py-20 lg:py-28"
    >
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-8">
        {/* --- The ask. --- */}
        <Reveal stagger className="lg:col-span-6 lg:col-start-1">
          <p className="eyebrow text-brass-bright">Talk to us</p>
          <h2
            id="home-contact-heading"
            className="mt-5 text-h2 text-ledger"
          >
            Ask us anything before you decide anything
          </h2>
          <p className="measure mt-5 text-body text-ledger/80">
            Nothing is paid on this website. Message us and you will usually
            hear back the same afternoon — and we would rather spend twenty
            minutes talking you out of a Labrador than place one badly. If we
            are not the right kennel for you, we will say so and give you two
            other names.
          </p>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/apply" variant="onDark" size="lg">
              Start an application
            </ButtonLink>
            <WhatsAppLink
              message={generalEnquiryMessage()}
              className={buttonClasses(
                "solid",
                "lg",
                "border border-ledger/40 bg-transparent text-ledger hover:bg-ledger hover:text-spruce",
              )}
            >
              Message us on WhatsApp
            </WhatsAppLink>
          </div>
        </Reveal>

        {/* --- The details, as ledger rows. --- */}
        <Reveal className="lg:col-span-5 lg:col-start-8">
          <dl className="hairline-dark">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-spruce-line py-3">
              <dt className="eyebrow text-enamel">Phone</dt>
              <dd className="font-mono text-data">
                <a
                  href={contact.phoneHref}
                  className="text-ledger underline decoration-brass-bright underline-offset-4 transition-colors duration-300 hover:text-brass-bright"
                >
                  {contact.phone}
                </a>
              </dd>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-spruce-line py-3">
              <dt className="eyebrow text-enamel">Email</dt>
              <dd className="font-mono text-data">
                <a
                  href={`mailto:${contact.email}`}
                  className="text-ledger underline decoration-brass-bright underline-offset-4 transition-colors duration-300 hover:text-brass-bright"
                >
                  {contact.email}
                </a>
              </dd>
            </div>

            {contact.hours.map((h) => (
              <div
                key={h.days}
                className="flex flex-wrap items-baseline justify-between gap-4 border-b border-spruce-line py-3"
              >
                <dt className="eyebrow text-enamel">{h.days}</dt>
                <dd className="font-mono text-data text-ledger">{h.time}</dd>
              </div>
            ))}

            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-spruce-line py-3">
              <dt className="eyebrow text-enamel">Where</dt>
              <dd className="text-right font-mono text-data text-ledger">
                {contact.locality}, {contact.region}
                <br />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-brass-bright underline-offset-4 transition-colors duration-300 hover:text-brass-bright"
                >
                  Open in maps ↗
                </a>
              </dd>
            </div>
          </dl>

          <p className="mt-6 text-small text-ledger/70">
            Visits by arrangement — there is usually a litter in the sitting
            room and we would like to know you are coming.{" "}
            <Link
              href="/contact"
              className="text-brass-bright underline decoration-brass-bright underline-offset-4 transition-colors duration-300 hover:text-ledger"
            >
              Full contact details
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
