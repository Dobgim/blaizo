import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

type Props = {
  /** Mono label in the ledger rail. Where you are, not a decoration. */
  eyebrow: string;
  /** Second rail line — a counter, a date, a coordinate. Only when true. */
  railNote?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
};

/**
 * The interior page opener.
 *
 * Same asymmetric grid as the home page: ledger rail on the left carrying mono
 * metadata, content field to its right. Interior pages have no hero image, so
 * the header sits on the page ground and the type does the work.
 */
export function PageHeader({
  eyebrow,
  railNote,
  title,
  intro,
  children,
}: Props) {
  return (
    <header className="shell pb-14 pt-32 lg:pb-20 lg:pt-44">
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="flex items-baseline gap-5 lg:col-span-2 lg:flex-col lg:items-start lg:gap-2">
          <p className="eyebrow text-canvas-deep">{eyebrow}</p>
          {railNote && <p className="eyebrow text-brass">{railNote}</p>}
        </div>

        <Reveal stagger className="lg:col-span-9 lg:col-start-3">
          <h1 className="text-display-l text-spruce">{title}</h1>
          {intro && (
            <p className="measure mt-6 text-body-l text-canvas-deep">{intro}</p>
          )}
          {children}
        </Reveal>
      </div>
    </header>
  );
}
