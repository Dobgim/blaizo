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
          compact ? "text-wordmark-sm" : "text-wordmark",
          onDark
            ? "text-ledger group-hover:text-brass-bright"
            : "text-spruce group-hover:text-foxred",
        ].join(" ")}
      >
        Ridgeline
      </span>
      {/* The subline used to shrink to 9.6px, which no colour on this palette
          could carry at 4.5:1. It holds at the micro token instead, and the
          compact variant tightens tracking rather than dropping size. */}
      <span
        className={[
          "eyebrow mt-1 text-micro transition-colors duration-300",
          compact ? "tracking-label" : "",
          onDark ? "text-brass-bright" : "text-canvas",
        ].join(" ")}
      >
        Retrievers · Est. {siteConfig.establishedYear}
      </span>
    </Link>
  );
}
