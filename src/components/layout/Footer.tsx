import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { footerNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site-config";
import { generalEnquiryMessage } from "@/lib/whatsapp";

const { contact } = siteConfig;

export function Footer() {
  return (
    <footer className="bg-ledger-deep">
      {/* ---------- Closing invitation ---------- */}
      <div className="shell border-b border-enamel py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 lg:col-start-1">
            <p className="eyebrow text-canvas-deep">Next step</p>
            <h2 className="mt-5 text-h2 text-spruce">
              Applications take about fifteen minutes, and we read every one.
            </h2>
            <p className="measure mt-5 text-body text-canvas-deep">
              Nothing is paid on this website. You answer the questions, the
              form hands your answers to us on WhatsApp, and we carry on the
              conversation from there. If we think another breeder is a better
              fit for what you are after, we will tell you that and give you two
              names.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:col-span-4 lg:col-start-9 lg:items-end lg:justify-end">
            <ButtonLink href="/apply" size="lg">
              Start an application
            </ButtonLink>
            <WhatsAppLink
              message={generalEnquiryMessage()}
              className={buttonClasses("outline", "lg")}
            >
              Message us on WhatsApp
            </WhatsAppLink>
            <a
              href={contact.phoneHref}
              className="eyebrow text-canvas-deep transition-colors duration-300 hover:text-foxred"
            >
              or call {contact.phone}
            </a>
          </div>
        </div>
      </div>

      {/* ---------- Directory ---------- */}
      <div className="shell py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <Wordmark />
            <address className="mt-6 not-italic">
              <p className="font-mono text-data text-canvas-deep">
                {contact.addressLine}
                <br />
                {contact.locality}, {contact.region} {contact.postalCode}
              </p>
              <p className="mt-4 flex flex-col gap-1">
                <a
                  href={contact.phoneHref}
                  className="text-small text-spruce underline decoration-brass decoration-1 underline-offset-4 transition-colors duration-300 hover:text-foxred"
                >
                  {contact.phone}
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-small text-spruce underline decoration-brass decoration-1 underline-offset-4 transition-colors duration-300 hover:text-foxred"
                >
                  {contact.email}
                </a>
                <WhatsAppLink
                  message={generalEnquiryMessage()}
                  className="inline-flex items-center gap-2 text-small text-spruce underline decoration-brass decoration-1 underline-offset-4 transition-colors duration-300 hover:text-foxred"
                >
                  {contact.whatsappDisplay} on WhatsApp
                </WhatsAppLink>
              </p>
            </address>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:col-start-5 lg:grid-cols-4 lg:gap-8">
            {footerNav.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <h2 className="eyebrow text-canvas-deep">{group.heading}</h2>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-small text-spruce transition-colors duration-300 hover:text-foxred"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Legal ---------- */}
      <div className="shell hairline flex flex-col gap-4 py-7 md:flex-row md:items-center md:justify-between">
        <p className="eyebrow text-canvas-deep">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <ul className="flex flex-wrap gap-x-7 gap-y-2">
          <li>
            <Link
              href="/privacy"
              className="eyebrow text-canvas-deep transition-colors duration-300 hover:text-foxred"
            >
              Privacy
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="eyebrow text-canvas-deep transition-colors duration-300 hover:text-foxred"
            >
              Terms
            </Link>
          </li>
          <li>
            <Link
              href="/process/guarantee"
              className="eyebrow text-canvas-deep transition-colors duration-300 hover:text-foxred"
            >
              Health guarantee
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
