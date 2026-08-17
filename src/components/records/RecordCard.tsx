import Image from "next/image";
import Link from "next/link";
import { StatusSeal } from "@/components/records/StatusSeal";
import { SaveButton } from "@/components/shortlist/SaveButton";
import type { ShortlistItem } from "@/components/shortlist/ShortlistProvider";
import type { PuppyStatus } from "@/lib/types";

export type RecordRow = { label: string; value: string };

type Props = {
  href: string;
  name: string;
  /** The brass tag. A litter position, a kennel number — something real. */
  tag: string;
  /** Mono strapline under the name: role, colour, date of birth. */
  meta: string;
  image: string;
  imageAlt: string;
  /** Aligned pedigree or clearance rows, set in the mono face. */
  rows: RecordRow[];
  status?: PuppyStatus;
  /** Sits on a spruce band rather than the page ground. */
  onDark?: boolean;
  sizes?: string;
  priority?: boolean;
  /** Enables the shortlist heart. Omit on cards that are not saveable. */
  saveItem?: ShortlistItem;
  /**
   * Strips the card back to photo, name and seal below `sm`.
   *
   * For three-across grids on a phone, where a card is about 110px wide. The
   * mono rows and the colour strapline do not survive that column — they wrap
   * to a paragraph of six-character lines. The whole card is still a link to
   * the full record, so nothing is lost, only deferred.
   */
  compact?: boolean;
};

/**
 * The kennel record card — the one place this site spends boldness.
 *
 * A physical artifact from the breeder's world: punched hole, brass tag,
 * pedigree data in aligned mono rows, and a status seal pressed slightly off
 * true. Everything around it stays quiet, which is what lets it work.
 *
 * Hover is CSS rather than GSAP so the card stays a Server Component and
 * behaves before any JavaScript arrives. Timings match the scripted motion
 * elsewhere: 400ms on a power2.out curve.
 */
export function RecordCard({
  href,
  name,
  tag,
  meta,
  image,
  imageAlt,
  rows,
  status,
  onDark = false,
  sizes = "(max-width: 640px) 78vw, (max-width: 1024px) 40vw, 22vw",
  priority = false,
  saveItem,
  compact = false,
}: Props) {
  /* Hidden on a phone, back from `sm`. Applied to everything that needs a
     column wider than a three-up grid gives it. */
  const wideOnly = compact ? "hidden sm:block" : "";

  return (
    <article
      className={[
        // h-full so a row of cards shares one height and the seals land on
        // a common baseline however the meta line wraps.
        "group relative flex h-full flex-col pb-5 pt-9",
        compact ? "px-2 sm:px-4" : "px-4",
        "transition-colors duration-[400ms] ease-out-quad",
        onDark
          ? "border border-spruce-line bg-spruce-soft"
          : "border border-enamel bg-ledger-bright",
      ].join(" ")}
    >
      {/* The punched hole. Filled with the ground behind the card, so it
          reads as a hole rather than a dot — which is why nothing on this
          site carries a drop shadow. */}
      <span
        aria-hidden
        className={[
          "absolute left-1/2 top-3 h-3.5 w-3.5 -translate-x-1/2 rounded-full ring-1 ring-inset",
          onDark ? "bg-spruce ring-spruce-line" : "bg-ledger ring-enamel",
        ].join(" ")}
      />

      {/* Outside the stretched link and above it, so the heart is its own
          target rather than a button nested in an anchor. */}
      {saveItem && (
        <SaveButton item={saveItem} onDark={onDark} compact={compact} />
      )}

      <div
        className={[
          "relative aspect-[4/5] overflow-hidden",
          onDark ? "bg-spruce" : "bg-canvas",
        ].join(" ")}
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-[400ms] ease-out-quad group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      {/* Name and brass tag. The tag has 8px of travel reserved to its right. */}
      <div className="mt-4 flex items-start justify-between gap-3 pr-2">
        <h3
          className={[
            "font-display leading-none",
            compact ? "text-body sm:text-h3" : "text-h3",
            onDark ? "text-ledger" : "text-spruce",
          ].join(" ")}
        >
          {/* Stretched link — the whole card is the target, but only the name
              is announced, so a screen reader gets one clear link per card. */}
          <Link
            href={href}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {name}
          </Link>
        </h3>

        {/* A litter code is twelve characters. There is no room for it beside
            a name in a three-up phone column, so it waits for `sm`. */}
        <span
          aria-hidden
          className={[
            "eyebrow shrink-0 bg-brass-tag px-2.5 py-1 text-spruce",
            wideOnly,
            "transition-transform duration-[400ms] ease-out-quad group-hover:translate-x-2 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0",
          ].join(" ")}
        >
          {tag}
        </span>
      </div>

      <p
        className={[
          "eyebrow mt-2.5",
          wideOnly,
          onDark ? "text-enamel" : "text-canvas-deep",
        ].join(" ")}
      >
        {meta}
      </p>

      {/* Record rows. Tabular figures keep the values aligned down the column
          across every card in a row. */}
      <dl
        className={[
          "mt-4 border-t pt-3",
          wideOnly,
          onDark ? "border-spruce-line" : "border-enamel",
        ].join(" ")}
      >
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-3 py-1"
          >
            <dt
              className={[
                "font-mono text-micro uppercase tracking-label",
                /* Full enamel, not 70% — the dimmed version measured 3.75:1
                   on spruce-soft. The label/value hierarchy is carried by
                   case and colour, which is enough without fading it. */
                onDark ? "text-enamel" : "text-canvas",
              ].join(" ")}
            >
              {row.label}
            </dt>
            <dd
              className={[
                "font-mono text-eyebrow tracking-normal text-right",
                onDark ? "text-ledger" : "text-spruce",
              ].join(" ")}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {status && (
        <div
          className={[
            "mt-auto flex pt-5",
            /* Centred in a narrow column: right-aligned, a rotated seal hangs
               its corner over the card edge. */
            compact ? "justify-center sm:justify-end" : "justify-end",
          ].join(" ")}
        >
          <StatusSeal status={status} compact={compact} />
        </div>
      )}
    </article>
  );
}
