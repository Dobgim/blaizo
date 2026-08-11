import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { buttonClasses } from "@/components/ui/Button";
import { DataRows } from "@/components/records/DataRows";
import { images } from "@/lib/images";
import { siteConfig } from "@/lib/site-config";
import { generalEnquiryMessage } from "@/lib/whatsapp";

const { contact } = siteConfig;

export const metadata: Metadata = {
  title: "Contact",
  description: `Reach ${siteConfig.name} on WhatsApp, by phone or by email. Where we are, when we answer, and what to expect when you get in touch.`,
};

/**
 * No contact form.
 *
 * The site's one form is the application, which is a considered fifteen
 * minutes. Putting a second, shallower form here would compete with it and
 * collect worse leads. Everything on this page is a direct line instead —
 * WhatsApp first, because that is where enquiries actually land.
 */
export default function ContactPage() {
  const mapQuery = encodeURIComponent(
    `${contact.addressLine}, ${contact.locality}, ${contact.region} ${contact.postalCode}`,
  );

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        railNote={`${contact.lat.toFixed(1)}°N ${Math.abs(contact.lng).toFixed(1)}°W`}
        title="Talk to us before you decide anything"
        intro="We would rather spend twenty minutes on the phone talking you out of a Labrador than place one badly. There is no form on this page — these all reach us directly."
      />

      <section className="shell pb-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* --- The direct lines. --- */}
          <div className="lg:col-span-5 lg:col-start-3">
            <h2 className="eyebrow text-foxred">The fastest way</h2>
            <p className="measure mt-4 text-body-l text-spruce">
              WhatsApp. It is where every enquiry lands, one of us has it on
              their phone all day, and you will usually hear back the same
              afternoon.
            </p>

            <div className="mt-7 flex flex-col items-start gap-4">
              <WhatsAppLink
                message={generalEnquiryMessage()}
                className={buttonClasses("solid", "lg")}
              >
                Message us on WhatsApp
              </WhatsAppLink>
              <p className="font-mono text-data text-canvas-deep">
                {contact.whatsappDisplay}
              </p>
            </div>

            <h2 className="eyebrow mt-14 text-foxred">Or, if you prefer</h2>
            <dl className="hairline mt-4">
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-enamel py-3">
                <dt className="eyebrow text-canvas">Phone</dt>
                <dd className="font-mono text-data">
                  <a
                    href={contact.phoneHref}
                    className="text-spruce underline decoration-brass underline-offset-4 transition-colors duration-300 hover:text-foxred"
                  >
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-enamel py-3">
                <dt className="eyebrow text-canvas">Email</dt>
                <dd className="font-mono text-data">
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-spruce underline decoration-brass underline-offset-4 transition-colors duration-300 hover:text-foxred"
                  >
                    {contact.email}
                  </a>
                </dd>
              </div>
            </dl>

            <p className="measure mt-8 text-small text-canvas-deep">
              Nothing is ever paid through this website. If anyone contacts you
              claiming to be us and asks for money by gift card, wire transfer
              or cryptocurrency, it is not us — call the number above and tell
              us about it.
            </p>
          </div>

          {/* --- Where and when. --- */}
          <div className="lg:col-span-3 lg:col-start-9">
            <h2 className="eyebrow text-canvas-deep">When we answer</h2>
            <DataRows
              className="mt-4"
              rows={contact.hours.map((h) => ({
                label: h.days,
                value: h.time,
              }))}
            />

            <h2 className="eyebrow mt-12 text-canvas-deep">Where we are</h2>
            <address className="mt-4 not-italic font-mono text-data text-spruce">
              {contact.addressLine}
              <br />
              {contact.locality}, {contact.region} {contact.postalCode}
            </address>
            <p className="mt-4">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow text-canvas-deep transition-colors duration-300 hover:text-foxred"
              >
                Open in maps →
              </a>
            </p>
            <p className="measure mt-6 text-small text-canvas-deep">
              Visits are by arrangement, not because we are precious about it
              but because there is usually a litter in the sitting room and we
              would like to know you are coming.
            </p>
          </div>
        </div>
      </section>

      {/* --- The drive in. A photograph does more here than a map tile. --- */}
      <Reveal>
        <div className="relative h-[45vh] min-h-[300px] overflow-hidden bg-canvas lg:h-[60vh]">
          <Image
            src={images["default-contact"].src}
            alt={images["default-contact"].alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </Reveal>
    </>
  );
}
