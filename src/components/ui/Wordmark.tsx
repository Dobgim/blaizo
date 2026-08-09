import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

/**
 * The kennel mark. Display face for the name, a mono strapline underneath
 * carrying the founding year — the same register as the record cards, so the
 * masthead and the artifacts on the page read as one system.
 */
export function Wordmark({
  onDark = false,
  compact = false,
}: {
  onDark?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className="group inline-flex flex-col leading-none"
      aria-label={`${siteConfig.name} — home`}
    >
      <span
        className={[
          "font-display tracking-tight transition-colors duration-300",
          compact ? "text-[1.35rem]" : "text-[1.6rem]",
          onDark
            ? "text-ledger group-hover:text-brass-bright"
            : "text-spruce group-hover:text-foxred",
        ].join(" ")}
      >
        Ridgeline
      </span>
      <span
        className={[
          "eyebrow mt-1 transition-colors duration-300",
          compact ? "text-[0.6rem]" : "text-[0.65rem]",
          onDark ? "text-brass-bright/80" : "text-canvas",
        ].join(" ")}
      >
        Retrievers · Est. {siteConfig.establishedYear}
      </span>
    </Link>
  );
}
