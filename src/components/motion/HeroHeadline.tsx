"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, EASE, prefersReducedMotion } from "@/lib/gsap";

/**
 * The page-load moment. One choreographed sequence, not twenty effects.
 *
 *   1. the hero photograph settles from 1.12 to 1.0 over 1.2s
 *   2. headline lines rise out of a clip mask, 80ms apart
 *   3. the supporting copy, then the buttons
 *   4. the nav arrives last
 *
 * Everything animates from a visible resting state that is written in the
 * markup, so a failed script leaves a correct, readable hero.
 */
export function HeroHeadline({
  lines,
  className,
}: {
  lines: string[];
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const image = document.querySelector("[data-hero-image]");
      const headlineLines = el.querySelectorAll("[data-hero-line]");
      const trailing = document.querySelectorAll("[data-hero-trail]");
      const header = document.querySelector('[data-motion="header"]');

      gsap.set(headlineLines, { yPercent: 110 });
      gsap.set(trailing, { opacity: 0, y: 16 });
      if (header) gsap.set(header, { opacity: 0 });
      if (image) gsap.set(image, { scale: 1.12 });

      const tl = gsap.timeline({ defaults: { ease: EASE } });

      if (image) tl.to(image, { scale: 1, duration: 1.2 }, 0);
      tl.to(headlineLines, { yPercent: 0, duration: 1, stagger: 0.08 }, 0.15);
      tl.to(trailing, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.6);
      if (header) tl.to(header, { opacity: 1, duration: 0.6 }, 0.9);
    });

    return () => ctx.revert();
  }, []);

  return (
    <h1 ref={ref} className={className}>
      {lines.map((line) => (
        // The mask. Padding compensates so descenders are not clipped.
        <span
          key={line}
          className="block overflow-hidden pb-[0.12em] -mb-[0.12em]"
        >
          <span data-hero-line className="block">
            {line}
          </span>
        </span>
      ))}
    </h1>
  );
}
