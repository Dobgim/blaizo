"use client";

import { useShortlist } from "@/components/shortlist/ShortlistProvider";

/**
 * The header's shortlist control — heart plus a running count.
 *
 * It used to hide itself until something had been saved, on the theory that an
 * empty cart icon is clutter. That was wrong: nobody discovers a feature whose
 * only entry point appears after you have already used it. It is now always
 * visible, shows 00 when empty, and opening it explains what the hearts do.
 *
 * Still renders nothing until the stored list has been read, so the server
 * markup and the first client render agree.
 */
export function ShortlistButton({ onDark = false }: { onDark?: boolean }) {
  const { items, open } = useShortlist();

  /* Rendered on the server too, showing 00. The stored list is read in an
     effect, so the server and the first client render both see an empty list
     and agree — then the real count arrives a tick later. Returning null until
     then made the control pop into the masthead after hydration, which is a
     large part of why it went unnoticed. */
  const count = items.length;

  return (
    <button
      type="button"
      onClick={open}
      className={[
        "inline-flex items-center gap-2 rounded-[2px] px-2.5 py-2 transition-colors duration-300",
        onDark
          ? "text-ledger hover:text-brass-bright"
          : "text-spruce hover:text-foxred",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        className="size-[1.15rem]"
        fill={count > 0 ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={count > 0 ? 0 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20.5s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 8.2a4.4 4.4 0 0 1 7.5 2.7c0 5-7.5 9.6-7.5 9.6Z" />
      </svg>

      <span className="font-mono text-data tabular-nums">
        {String(count).padStart(2, "0")}
      </span>

      <span className="sr-only">
        {count === 0
          ? "Your shortlist is empty — open it"
          : `${count} saved — open your shortlist`}
      </span>
    </button>
  );
}
