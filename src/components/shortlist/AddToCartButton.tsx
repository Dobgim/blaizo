"use client";

import { buttonClasses } from "@/components/ui/Button";
import {
  useShortlist,
  type ShortlistItem,
} from "@/components/shortlist/ShortlistProvider";

/**
 * "Add to cart", on a puppy's own page.
 *
 * The same list the heart on a card writes to — a visitor who saves three
 * puppies from the index and adds a fourth from its page should find four in
 * one place, not two lists that disagree. The heart is the compact form for a
 * grid; this is the full-width form for the one page where the visitor has
 * already decided they are interested.
 *
 * It does not check out, and nothing about it implies it does: the order
 * button sits above it, and the cart is a list to talk about. Adding opens the
 * drawer, because a button that changes a counter in the far corner of the
 * screen gives no feedback to anyone not looking at the corner.
 */
export function AddToCartButton({ item }: { item: ShortlistItem }) {
  const { has, toggle, open, ready } = useShortlist();
  const inCart = ready && has(item.id);

  return (
    <button
      type="button"
      onClick={() => {
        toggle(item);
        /* Only on the way in. Opening the drawer as something is removed puts
           the thing they just dismissed back in front of them. */
        if (!inCart) open();
      }}
      aria-pressed={inCart}
      className={buttonClasses("outline", "lg")}
    >
      <span className="flex items-center justify-center gap-2.5">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className="size-[1.05rem] shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {inCart ? (
            <path d="m4.5 12.5 5 5 10-11" />
          ) : (
            <>
              <path d="M3 4h2.2l2.3 11.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2L21 8H6" />
              <circle cx="10" cy="20" r="1.1" />
              <circle cx="17.5" cy="20" r="1.1" />
            </>
          )}
        </svg>
        {inCart ? `${item.name} is in your cart` : "Add to cart"}
      </span>
    </button>
  );
}
