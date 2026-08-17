"use client";

import { useShortlist } from "@/components/shortlist/ShortlistProvider";

/**
 * The header's cart control — a trolley with a count on it.
 *
 * A heart with "00" beside it read as a wishlist, which undersold what the
 * panel behind it now does: it holds puppies and it places the order. A trolley
 * with a badge is the one piece of iconography every shopper already knows, and
 * borrowing it costs nothing here because the meaning is honest — this really
 * is the cart.
 *
 * The badge only appears once there is something in it. An empty trolley is
 * still shown, though: it used to hide itself until something had been saved,
 * which meant nobody discovered the feature whose only entry point appears
 * after you have already used it.
 */
export function ShortlistButton({ onDark = false }: { onDark?: boolean }) {
  const { items, open } = useShortlist();

  /* Rendered on the server too, as an empty trolley. The stored list is read in
     an effect, so the server and the first client render agree — the count
     arrives a tick later. */
  const count = items.length;

  return (
    <button
      type="button"
      onClick={open}
      className={[
        "relative inline-flex size-11 items-center justify-center rounded-[2px]",
        "transition-colors duration-300",
        onDark
          ? "text-ledger hover:text-brass-bright"
          : "text-spruce hover:text-foxred",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        className="size-[1.35rem]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 3h2.1a1 1 0 0 1 .98.8l2.6 12.2h9.9a1 1 0 0 0 .97-.76L21 8.5H6.2" />
        <circle cx="9.5" cy="20" r="1.4" />
        <circle cx="17.5" cy="20" r="1.4" />
      </svg>

      {count > 0 && (
        <span
          aria-hidden="true"
          className={[
            "absolute -right-0.5 -top-0.5 flex min-w-[1.15rem] items-center justify-center",
            "rounded-full px-1 py-0.5 font-mono text-micro leading-none tabular-nums",
            /* Fox red against either ground, with a ring in the header's own
               colour so the badge reads as sitting on top of the trolley rather
               than merging into its outline. */
            "bg-foxred text-ledger",
            onDark ? "ring-2 ring-spruce" : "ring-2 ring-ledger",
          ].join(" ")}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}

      <span className="sr-only">
        {count === 0
          ? "Your cart is empty — open it"
          : `${count} in your cart — open it`}
      </span>
    </button>
  );
}
