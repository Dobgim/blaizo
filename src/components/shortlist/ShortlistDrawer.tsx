"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShortlist } from "@/components/shortlist/ShortlistProvider";
import { buttonClasses } from "@/components/ui/Button";
import { shortlistMessage, whatsappUrl } from "@/lib/whatsapp";

/**
 * The shortlist drawer.
 *
 * The equivalent of a cart panel, except the primary action opens a WhatsApp
 * conversation about the dogs rather than a checkout. Same modal discipline as
 * the waiting-list popup: focus in, trapped, returned; Escape and backdrop
 * close it; the page behind does not scroll.
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
            <p className="eyebrow text-brass-text">Your shortlist</p>
            <h2
              id="shortlist-heading"
              className="mt-2 font-display text-h3 text-spruce"
            >
              {items.length === 0
                ? "Nothing saved yet"
                : `${items.length} saved`}
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
            <span className="sr-only">Close shortlist</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-body text-canvas-deep">
              Tap the heart on any puppy or dog to keep it here while you look
              around. Nothing is reserved by saving it, and nothing is charged
              — the list is just a way to remember which ones you liked.
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
                <li
                  key={item.id}
                  className="flex items-center gap-4 border-b border-enamel p-4"
                >
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
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="eyebrow shrink-0 text-canvas-deep transition-colors duration-200 hover:text-foxred"
                  >
                    Remove
                    <span className="sr-only"> {item.name} from shortlist</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-enamel p-6">
              <a
                href={whatsappUrl(shortlistMessage(items))}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("solid", "lg", "w-full")}
              >
                Ask about these on WhatsApp
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
                  Saving does not reserve a puppy.
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
          </>
        )}
      </div>
    </div>
  );
}
