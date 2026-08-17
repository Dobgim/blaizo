"use client";

import { useShortlist, type ShortlistItem } from "@/components/shortlist/ShortlistProvider";

/**
 * The heart on a record card.
 *
 * Sits above the card's stretched link rather than inside it — a button nested
 * in an anchor is invalid markup and unusable by keyboard, so this is a
 * sibling with a higher stacking order.
 *
 * It is a toggle, so it carries aria-pressed and its accessible name says
 * which dog it applies to. On a page of twelve cards, twelve buttons all
 * called "Save" are useless to a screen reader.
 */
export function SaveButton({
  item,
  onDark = false,
  compact = false,
}: {
  item: ShortlistItem;
  onDark?: boolean;
  /**
   * Smaller on a phone, for three-up grids.
   *
   * 44px on a 110px card covers the puppy's face, which is the one thing the
   * card exists to show. 32px still clears the 24px WCAG 2.2 target minimum
   * comfortably, and it goes back to 44 as soon as there is room.
   */
  compact?: boolean;
}) {
  const { has, toggle, ready } = useShortlist();
  const saved = ready && has(item.id);

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-pressed={saved}
      className={[
        "absolute z-20 flex items-center justify-center rounded-full",
        compact
          ? "right-1 top-8 size-8 sm:right-2.5 sm:top-10 sm:size-11"
          : "right-2.5 top-10 size-11",
        "transition-colors duration-[400ms] ease-out-quad",
        saved
          ? "bg-foxred text-ledger"
          : onDark
            ? "bg-spruce/80 text-enamel hover:bg-spruce hover:text-ledger"
            : "bg-ledger/85 text-canvas-deep hover:bg-ledger hover:text-foxred",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        className={compact ? "size-[0.85rem] sm:size-[1.05rem]" : "size-[1.05rem]"}
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={saved ? 0 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20.5s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 8.2a4.4 4.4 0 0 1 7.5 2.7c0 5-7.5 9.6-7.5 9.6Z" />
      </svg>
      <span className="sr-only">
        {saved
          ? `Remove ${item.name} from your shortlist`
          : `Save ${item.name} to your shortlist`}
      </span>
    </button>
  );
}
