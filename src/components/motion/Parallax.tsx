"use client";

import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Gentle background parallax: 0 to -60px across the section's scroll range.
 *
 * The moving element must be over-sized by the caller (scale, or a taller
 * absolute wrapper) so the drift never exposes an edge.
 */
export function Parallax({
  children,
  distance = 60,
  className,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: 0 },
        {
          y: -distance,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [distance]);

  return (
    <div ref={ref} data-parallax className={className}>
      {children}
    </div>
  );
}
