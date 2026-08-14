import Link from "next/link";
import { KennelMark } from "@/components/ui/KennelMark";
import { siteConfig } from "@/lib/site-config";

/**
 * The kennel mark and name.
 *
 * Brass tag, then the name in the display face with a mono strapline under it
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
      className="group inline-flex items-center gap-2.5 leading-none"
      aria-label={`${siteConfig.name} — home`}
    >
      {/* Full brass, not brass-text. The mark is decorative and aria-hidden,
          with the kennel's name set beside it — it carries no information of
          its own, so it is not held to text contrast, and the darker tint
          just made it read as a smudge at this size. */}
      <KennelMark
        className={[
          "shrink-0 transition-colors duration-300",
          compact ? "size-8" : "size-10",
          onDark ? "text-brass-bright" : "text-brass",
        ].join(" ")}
      />

      <span className="inline-flex flex-col">
        <span
          className={[
            "font-display tracking-tight transition-colors duration-300",
            compact ? "text-wordmark-sm" : "text-wordmark",
            onDark
              ? "text-ledger group-hover:text-brass-bright"
              : "text-spruce group-hover:text-foxred",
          ].join(" ")}
        >
          Golden Pup
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
          Kennel · Est. {siteConfig.establishedYear}
        </span>
      </span>
    </Link>
  );
}
