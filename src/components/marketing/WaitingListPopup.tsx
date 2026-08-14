"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { images } from "@/lib/images";
import { siteConfig } from "@/lib/site-config";
import { whatsappUrl } from "@/lib/whatsapp";

/**
 * The waiting-list invitation, shown once on a visitor's first look around.
 *
 * Rules it follows, because an interstitial that breaks any of them costs more
 * trust than the addresses are worth:
 *
 *   - It waits. Firing the instant the page paints interrupts the hero before
 *     anyone has read a word; a short delay means it arrives after they have
 *     decided the site is worth their attention.
 *   - It remembers. Dismiss or submit and it does not come back — the choice
 *     is kept in localStorage, so it survives a reload and a second visit.
 *   - It is closable in the three ways people try: the button, the backdrop,
 *     and Escape.
 *   - It is a real modal. Focus moves into it, is trapped while open, is
 *     returned to where it came from on close, and the page behind is inert
 *     to a screen reader.
 *   - It never appears in the admin panel, and never for a visitor who has
 *     asked for reduced motion to be respected — that group is
 *     disproportionately likely to find an interstitial hostile.
 *
 * No payment, no account. It collects a name and an email and hands the pair
 * to WhatsApp, exactly like every other conversion path on this site.
 */

const STORAGE_KEY = "goldenpup:waiting-list-seen";
const DELAY_MS = 6000;

export function WaitingListPopup() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusTo = useRef<Element | null>(null);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* Private browsing can refuse storage. Closing still works; the popup
         may reappear next visit, which is a far smaller problem than a
         dialog that cannot be shut. */
    }
    if (returnFocusTo.current instanceof HTMLElement) {
      returnFocusTo.current.focus();
    }
  }, []);

  // --- Decide whether to show it at all -------------------------------------
  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;
    if (window.location.pathname.startsWith("/admin")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // --- Modal behaviour while open -------------------------------------------
  useEffect(() => {
    if (!open) return;

    returnFocusTo.current = document.activeElement;
    closeRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== "Tab") return;

      // Focus trap.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;

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
    };
  }, [open, dismiss]);

  if (!open) return null;

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (name.trim().length < 2) {
      setError("Tell us your name so we know who we are writing to.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("That email address does not look right. Check for a typo.");
      return;
    }

    const message = [
      `Hello — please add me to the waiting list for ${siteConfig.name}.`,
      "",
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
    ].join("\n");

    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
    dismiss();
  }

  const fieldClasses =
    "mt-2 w-full rounded-[2px] border border-enamel bg-ledger-bright px-4 py-3 text-body text-spruce transition-colors duration-200 hover:border-canvas";

  return (
    /* Scrolling lives on the outer block element, and the flex centring on an
       inner wrapper with min-h-full. Centring a taller-than-viewport child
       directly on a scroll container clips its top edge and makes it
       unreachable — on a phone that meant the close button sat above the
       viewport with no way to scroll up to it. */
    <div
      className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-spruce/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        className="flex min-h-full items-end justify-center p-4 sm:items-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) dismiss();
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="waiting-list-heading"
          aria-describedby="waiting-list-body"
          className="relative w-full max-w-[26rem] border border-enamel bg-ledger"
        >
          {/* 44px hit area — the iOS minimum — and it stays inside the panel
              rather than floating over the image edge, so it cannot end up
              under a browser chrome overlay. */}
          <button
            ref={closeRef}
            type="button"
            onClick={dismiss}
            className="absolute right-2.5 top-2.5 z-10 flex size-11 items-center justify-center rounded-[2px] bg-ledger/95 text-spruce transition-colors duration-200 hover:bg-spruce hover:text-ledger"
          >
            <span aria-hidden className="text-[1.35rem] leading-none">
              ×
            </span>
            <span className="sr-only">Close</span>
          </button>

          {/* Shorter crop on a phone: the image is the first thing to give up
              height when the panel has to fit a short viewport. */}
          <div className="relative aspect-[16/7] overflow-hidden bg-canvas sm:aspect-[16/10]">
            <Image
              src={images["default-puppy"].src}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 26rem"
              className="object-cover"
            />
          </div>

          <div className="p-5 sm:p-7">
          <p className="eyebrow text-foxred">Waiting list</p>
          <h2
            id="waiting-list-heading"
            className="mt-3 font-display text-h3 text-spruce"
          >
            Hear about a litter before it reaches this page
          </h2>
          <p
            id="waiting-list-body"
            className="mt-3 text-small text-canvas-deep"
          >
            Most of our puppies are spoken for before they are listed publicly.
            Leave your name and we will write to you when a pairing is
            confirmed. No charge, no deposit, and we do not pass your details
            to anyone.
          </p>

          <form onSubmit={onSubmit} className="mt-6" noValidate>
            <label htmlFor="wl-name" className="eyebrow block text-canvas-deep">
              Name
            </label>
            <input
              id="wl-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(error)}
              className={fieldClasses}
            />

            <label
              htmlFor="wl-email"
              className="eyebrow mt-5 block text-canvas-deep"
            >
              Email
            </label>
            <input
              id="wl-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "wl-error" : undefined}
              className={fieldClasses}
            />

            {error && (
              <p
                id="wl-error"
                role="alert"
                className="mt-3 text-small font-medium text-foxred"
              >
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="mt-6 w-full">
              Send on WhatsApp
            </Button>

            <button
              type="button"
              onClick={dismiss}
              className="eyebrow mt-4 w-full text-canvas-deep transition-colors duration-200 hover:text-foxred"
            >
              No thanks, I am just looking
            </button>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
