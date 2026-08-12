import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

/**
 * A missing page, presented as a missing record.
 *
 * The site's whole visual language is a card index, so a 404 is a card that is
 * not in the drawer — which is both more honest and more useful than an
 * apology. Every route out of here is one somebody who mistyped a puppy's name
 * would actually want.
 */
export default function NotFound() {
  return (
    <section className="shell flex min-h-[70vh] items-center py-32">
      <div className="grid w-full gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="flex items-baseline gap-5 lg:col-span-2 lg:flex-col lg:items-start lg:gap-2">
          <p className="font-mono text-[2.5rem] leading-none text-foxred">404</p>
          <p className="eyebrow text-canvas-deep">No record</p>
        </div>

        <div className="lg:col-span-6 lg:col-start-3">
          <h1 className="text-display-l text-spruce">
            There is no card in the drawer for that
          </h1>
          <p className="measure mt-6 text-body-l text-canvas-deep">
            The page has either moved or never existed. If you followed a link
            to a particular puppy, it may simply have been placed — every dog we
            have bred stays on the site, so it is worth checking the archive.
          </p>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/puppies" size="lg">
              Available puppies
            </ButtonLink>
            <ButtonLink href="/" variant="outline" size="lg">
              Back to the start
            </ButtonLink>
          </div>
        </div>

        <nav
          aria-label="Other places to look"
          className="lg:col-span-3 lg:col-start-10"
        >
          <p className="eyebrow text-canvas-deep">Or try</p>
          <ul className="hairline mt-4">
            {[
              { href: "/puppies/past", label: "The archive of placed puppies" },
              { href: "/dogs", label: "Our dogs" },
              { href: "/process/health-testing", label: "Health testing" },
              { href: "/contact", label: "Contact us" },
            ].map((link) => (
              <li key={link.href} className="border-b border-enamel">
                <Link
                  href={link.href}
                  className="block py-3 text-small text-spruce transition-colors duration-300 hover:text-foxred"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
