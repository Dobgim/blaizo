"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShortlist } from "@/components/shortlist/ShortlistProvider";
import { buttonClasses } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { shortlistMessage, whatsappUrl } from "@/lib/whatsapp";

/**
 * The cart.
 *
 * Everything saved, in one panel, each puppy carrying its own Order button.
 * That per-item button is the only honest shape here: an order is for one
 * named puppy at one price, and the invoice, the email and the `orders` row
 * are all built that way. A single "check out all" control would imply the
 * kennel sells three puppies in one transaction, which it does not — and a
 * cart total would be a number nobody is ever asked to pay.
 *
 * Adult dogs can sit in the list too. They are not for sale, so they get no
 * price and no Order button, only a link to their record.
 *
 * Same modal discipline as the waiting-list popup: focus in, trapped,
 * returned; Escape and backdrop close it; the page behind does not scroll.
 */
export function ShortlistDrawer() {
  const { items, isOpen, close, remove, clear } = useShortlist();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusTo = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    returnFocusTo.current = document.activeElement;
    closeRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      if (returnFocusTo.current instanceof HTMLElement) {
        returnFocusTo.current.focus();
      }
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  /* Only puppies can be ordered, and only ones still available. Adult dogs and
     anything already placed are in the list to look at, not to buy. */
  const orderable = items.filter(
    (i) => i.kind === "puppy" && i.orderable !== false,
  );
  const orderableTotal = orderable.reduce(
    (sum, i) => sum + (i.priceCents ?? 0),
    0,
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex justify-end bg-spruce/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortlist-heading"
        className="flex h-full w-full max-w-[26rem] flex-col border-l border-enamel bg-ledger"
      >
        <div className="flex items-start justify-between gap-4 border-b border-enamel p-6">
          <div>
            <p className="eyebrow text-brass-text">Your cart</p>
            <h2
              id="shortlist-heading"
              className="mt-2 font-display text-h3 text-spruce"
            >
              {items.length === 0
                ? "Nothing added yet"
                : `${items.length} ${items.length === 1 ? "item" : "items"}`}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="flex size-9 shrink-0 items-center justify-center rounded-[2px] text-spruce transition-colors duration-200 hover:bg-spruce hover:text-ledger"
          >
            <span aria-hidden className="text-[1.25rem] leading-none">
              ×
            </span>
            <span className="sr-only">Close your cart</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-body text-canvas-deep">
              Use &ldquo;Add to cart&rdquo; on a puppy&rsquo;s page, or the
              heart on any card, and they will wait for you here. Adding does
              not reserve anything and nothing is charged — you place the order
              from this panel when you are ready.
            </p>
            <p className="mt-6">
              <Link
                href="/puppies"
                onClick={close}
                className="border-b border-brass pb-1 text-body text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
              >
                See the available puppies
              </Link>
            </p>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="border-b border-enamel p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative size-16 shrink-0 overflow-hidden bg-canvas">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/${item.kind === "puppy" ? "puppies" : "dogs"}/${item.slug}`}
                        onClick={close}
                        className="font-display text-h3 leading-none text-spruce transition-colors duration-200 hover:text-foxred"
                      >
                        {item.name}
                      </Link>
                      <p className="eyebrow mt-1.5 text-canvas-deep">
                        {item.tag}
                      </p>
                      {/* Nothing at all rather than "$0" — a puppy whose price
                          has not been set yet is an "ask us", not a freebie. */}
                      {item.priceCents ? (
                        <p className="mt-1.5 font-mono text-data text-spruce">
                          {formatPrice(item.priceCents)}
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="eyebrow shrink-0 text-canvas-deep transition-colors duration-200 hover:text-foxred"
                    >
                      Remove
                      <span className="sr-only"> {item.name} from your cart</span>
                    </button>
                  </div>

                  {/* Adult dogs and placed puppies fall through to nothing.
                      With more than one puppy in the cart these step back to
                      outlines: the combined order at the foot is the main
                      action, and this becomes the way to take just one. */}
                  {item.kind === "puppy" && item.orderable !== false && (
                    <Link
                      href={`/checkout?puppy=${item.slug}`}
                      onClick={close}
                      className={buttonClasses(
                        orderable.length > 1 ? "outline" : "solid",
                        "md",
                        "mt-3 w-full",
                      )}
                    >
                      {orderable.length > 1
                        ? `Order only ${item.name}`
                        : `Order ${item.name}`}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="border-t border-enamel p-6">
              {/* Two or more puppies: one order, one reference, one total, one
                  phone call. A family taking littermates should not have to go
                  through checkout twice and end up with two invoices for what
                  is, to them, a single purchase. */}
              {orderable.length > 1 && (
                <>
                  <Link
                    href={`/checkout?puppies=${orderable
                      .map((i) => i.slug)
                      .join(",")}`}
                    onClick={close}
                    className={buttonClasses("solid", "lg", "w-full")}
                  >
                    Order all {orderable.length} together
                  </Link>
                  <p className="mt-3 flex items-baseline justify-between gap-4">
                    <span className="eyebrow text-canvas-deep">
                      Total, paid in full
                    </span>
                    <span className="font-mono text-data text-spruce">
                      {orderableTotal > 0 ? formatPrice(orderableTotal) : "Ask us"}
                    </span>
                  </p>
                  <hr className="mt-6 border-t border-enamel" />
                </>
              )}

              {/* WhatsApp is for questions. Making it the loudest control in a
                  cart would send buyers to a chat when they came to order. */}
              <div className={orderable.length > 1 ? "mt-6" : ""}>
              <a
                href={whatsappUrl(shortlistMessage(items))}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("outline", "lg", "w-full")}
              >
                Ask a question on WhatsApp
              </a>

              <Link
                href="/apply"
                onClick={close}
                className={buttonClasses("outline", "lg", "mt-3 w-full")}
              >
                Start an application
              </Link>

              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="text-small text-canvas-deep">
                  Adding does not reserve a puppy.
                </p>
                <button
                  type="button"
                  onClick={clear}
                  className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred"
                >
                  Clear all
                </button>
              </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
