"use client";

import { useShortlist } from "@/components/shortlist/ShortlistProvider";

/**
 * The header's shortlist control — heart plus a running count.
 *
 * Renders nothing until the stored list has been read, so the server markup
 * and the first client render agree. It then appears only once something has
 * actually been saved: an empty cart icon on a kennel site is clutter that
 * invites the wrong mental model.
 */
export function ShortlistButton({ onDark = false }: { onDark?: boolean }) {
  const { items, open, ready } = useShortlist();

  if (!ready || items.length === 0) return null;

  return (
    <button
      type="button"
      onClick={open}
      className={[
        "inline-flex items-center gap-2 rounded-[2px] px-3 py-2 transition-colors duration-300",
        onDark
          ? "text-ledger hover:text-brass-bright"
          : "text-spruce hover:text-foxred",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        className="size-[1.05rem]"
        fill="currentColor"
      >
        <path d="M12 20.5s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 8.2a4.4 4.4 0 0 1 7.5 2.7c0 5-7.5 9.6-7.5 9.6Z" />
      </svg>
      <span className="font-mono text-data tabular-nums">{items.length}</span>
      <span className="sr-only">
        saved — open your shortlist
      </span>
    </button>
  );
}
