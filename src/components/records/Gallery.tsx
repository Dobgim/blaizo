"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * A photograph gallery with a full-size viewer.
 *
 * Tapping any picture opens it large, with the rest reachable by arrow key, by
 * the on-screen arrows, or by swiping. This is the part of a puppy's page
 * people actually spend time on — they are trying to see the dog properly, and
 * a grid of thumbnails they cannot enlarge is the commonest way a breeder site
 * fails them.
 *
 * The viewer is a real modal: focus moves in and is trapped, Escape closes it,
 * the page behind does not scroll, and focus returns to the thumbnail that
 * opened it so keyboard users do not lose their place in a long strip.
 */
export function Gallery({
  images,
  name,
}: {
  /** Hero first, then the rest. Already de-duplicated by the caller. */
  images: { src: string; alt: string }[];
  name: string;
}) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const close = useCallback(() => {
    setOpenAt(null);
    if (openerRef.current instanceof HTMLElement) openerRef.current.focus();
  }, []);

  const step = useCallback(
    (by: number) =>
      setOpenAt((i) => (i === null ? i : (i + by + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (openAt === null) return;

    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled])',
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
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [openAt, close, step]);

  if (images.length === 0) return null;

  const current = openAt === null ? null : images[openAt];

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, i) => (
          <li key={`${image.src}-${i}`}>
            <button
              type="button"
              onClick={(e) => {
                openerRef.current = e.currentTarget;
                setOpenAt(i);
              }}
              className="group relative block aspect-square w-full overflow-hidden bg-canvas"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                className="object-cover transition-transform duration-[400ms] ease-out-quad group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <span className="sr-only">
                Open photograph {i + 1} of {images.length} of {name}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div
          className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-spruce/90"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            className="flex min-h-full items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={`${name}, photograph ${(openAt ?? 0) + 1} of ${images.length}`}
              className="relative w-full max-w-[52rem]"
              onTouchStart={(e) => {
                touchStartX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (touchStartX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
                touchStartX.current = null;
              }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-spruce-soft">
                <Image
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 52rem"
                  className="object-contain"
                  priority
                />
              </div>

              <div className="on-dark mt-3 flex items-center justify-between gap-4">
                <p className="eyebrow text-enamel">
                  {(openAt ?? 0) + 1} / {images.length}
                </p>

                <div className="flex items-center gap-2">
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => step(-1)}
                        className="flex size-11 items-center justify-center rounded-[2px] text-ledger transition-colors duration-200 hover:bg-ledger hover:text-spruce"
                      >
                        <span aria-hidden className="text-[1.2rem] leading-none">←</span>
                        <span className="sr-only">Previous photograph</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => step(1)}
                        className="flex size-11 items-center justify-center rounded-[2px] text-ledger transition-colors duration-200 hover:bg-ledger hover:text-spruce"
                      >
                        <span aria-hidden className="text-[1.2rem] leading-none">→</span>
                        <span className="sr-only">Next photograph</span>
                      </button>
                    </>
                  )}
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    className="flex size-11 items-center justify-center rounded-[2px] bg-ledger text-spruce transition-colors duration-200 hover:bg-brass-bright"
                  >
                    <span aria-hidden className="text-[1.35rem] leading-none">×</span>
                    <span className="sr-only">Close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
