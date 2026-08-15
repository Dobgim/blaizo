"use client";

import { usePathname } from "next/navigation";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { siteConfig } from "@/lib/site-config";
import { generalEnquiryMessage } from "@/lib/whatsapp";

const { contact } = siteConfig;

/**
 * The closing invitation above the footer directory.
 *
 * Hidden on the pages that *are* the invitation. Offering "Start an
 * application" to somebody already filling in the application is the site
 * asking twice, and on /apply the button would link to the page you are
 * standing on.
 */
/* "/" is here because the home page closes with its own contact band, which
   carries the same two actions plus the phone number and hours. Repeating the
   invitation 200px below it is the site asking twice. */
/* "/checkout" covers the invoice too. Someone who has just committed to a
   four-figure purchase does not need to be asked to start an application —
   under a total due, it reads as though the order did not count. */
const SUPPRESS_ON = ["/", "/apply", "/contact", "/checkout"];

export function ClosingInvitation() {
  const pathname = usePathname();
  if (SUPPRESS_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  return (
    <div className="shell border-b border-enamel py-14 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7 lg:col-start-1">
          <p className="eyebrow text-canvas-deep">Next step</p>
          <h2 className="mt-5 text-h2 text-spruce">
            Applications take about fifteen minutes, and we read every one.
          </h2>
          <p className="measure mt-5 text-body text-canvas-deep">
            Applying is free and commits you to nothing — it is how we get to know
            you, and it is separate from ordering. If we think another breeder
            is a better fit for what you are after, we will tell you that and
            give you two names.
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
            Ask a question on WhatsApp
          </WhatsAppLink>
          <a
            href={contact.phoneHref}
            className="eyebrow inline-flex min-h-11 items-center text-canvas-deep transition-colors duration-300 hover:text-foxred"
          >
            or call or text {contact.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
