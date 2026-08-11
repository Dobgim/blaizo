import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { buttonClasses } from "@/components/ui/Button";
import { processNeighbours } from "@/lib/content/process";
import { generalEnquiryMessage } from "@/lib/whatsapp";

/**
 * Shared frame for the five process pages.
 *
 * Ledger rail carries the step number — earned here, because this is a real
 * sequence — and the foot of every page offers the next step rather than
 * dead-ending. The closing question is deliberately soft: these pages are for
 * people still deciding, and asking them to apply mid-read is pushy.
 */
export function ProcessLayout({
  slug,
  title,
  intro,
  children,
}: {
  slug: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  const { current } = processNeighbours(slug);

  return (
    <article>
      <header className="shell pb-12 pt-32 lg:pb-16 lg:pt-44">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="flex items-baseline gap-5 lg:col-span-2 lg:flex-col lg:items-start lg:gap-2">
            <p className="font-mono text-[2.5rem] leading-none text-foxred">
              {current?.n}
            </p>
            <p className="eyebrow text-canvas-deep">
              Step {current?.n} of {String(5).padStart(2, "0")}
            </p>
          </div>

          <Reveal stagger className="lg:col-span-9 lg:col-start-3">
            <h1 className="text-display-l text-spruce">{title}</h1>
            <p className="measure mt-6 text-body-l text-canvas-deep">{intro}</p>
          </Reveal>
        </div>
      </header>

      <div className="shell pb-20">
        <div className="grid lg:grid-cols-12">
          <div className="longform text-body text-spruce lg:col-span-8 lg:col-start-3">
            {children}
          </div>
        </div>
      </div>

      <ProcessFoot slug={slug} />
    </article>
  );
}

/** The closing band, shared with pages that need a richer body layout. */
export function ProcessFoot({ slug }: { slug: string }) {
  const { previous, next } = processNeighbours(slug);

  return (
    <>
      <section className="on-dark bg-spruce py-16 lg:py-20">
        <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6 lg:col-start-3">
            <h2 className="text-h2 text-ledger">
              Anything here you would rather we explained on the phone?
            </h2>
            <p className="measure mt-4 text-body text-ledger/80">
              Ask before you apply, not after. We would rather spend twenty
              minutes talking you out of a Labrador than place one badly.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsAppLink
                message={generalEnquiryMessage()}
                className={buttonClasses("onDark", "lg")}
              >
                Ask us on WhatsApp
              </WhatsAppLink>
            </div>
          </div>

          <nav
            aria-label="Process steps"
            className="flex flex-col justify-end gap-3 lg:col-span-3 lg:col-start-10 lg:items-end"
          >
            {previous && (
              <Link
                href={`/process/${previous.slug}`}
                className="eyebrow text-enamel transition-colors duration-300 hover:text-brass-bright"
              >
                ← {previous.n} {previous.title}
              </Link>
            )}
            {next && (
              <Link
                href={`/process/${next.slug}`}
                className="eyebrow text-brass-bright transition-colors duration-300 hover:text-ledger"
              >
                {next.n} {next.title} →
              </Link>
            )}
          </nav>
        </div>
      </section>
    </>
  );
}
