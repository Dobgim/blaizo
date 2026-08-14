import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

/**
 * The kennel logo and name.
 *
 * The mark is the client's own artwork (public/brand/logo.png) — a golden
 * retriever's head in a gold-edged black tile. It already carries its own
 * background, so it is not tinted and does not change between the light header
 * and the transparent one over the hero; only the type beside it does.
 *
 * `priority` because it sits in the masthead and would otherwise be the one
 * lazy image above the fold on every page.
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
      className="group inline-flex items-center gap-3 leading-none"
      aria-label={`${siteConfig.name} — home`}
    >
      <Image
        src="/brand/logo.png"
        alt=""
        width={162}
        height={162}
        priority
        sizes="48px"
        className={[
          "shrink-0 rounded-[6px]",
          compact ? "size-9" : "size-11",
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
