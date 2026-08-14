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
}: {
  item: ShortlistItem;
  onDark?: boolean;
}) {
  const { has, toggle, ready } = useShortlist();
  const saved = ready && has(item.id);

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-pressed={saved}
      className={[
        "absolute right-3 top-11 z-20 flex size-9 items-center justify-center rounded-full",
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
        className="size-[1.05rem]"
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
