import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { ClosingInvitation } from "@/components/layout/ClosingInvitation";
import { footerNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site-config";
import { generalEnquiryMessage } from "@/lib/whatsapp";

const { contact } = siteConfig;

export function Footer() {
  return (
    <footer data-site-footer className="bg-ledger-deep">
      <ClosingInvitation />

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
                  {contact.whatsappDisplay} — WhatsApp questions
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
        {/* Pinned to the founding year rather than new Date(). A copyright
            line is the one place on a page that silently rewrites itself, and
            the client asked for a fixed year they control. */}
        <p className="eyebrow text-canvas-deep">
          © {siteConfig.establishedYear} {siteConfig.name}
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
