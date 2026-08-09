"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, EASE, prefersReducedMotion } from "@/lib/gsap";

/**
 * Counts a real figure up from zero, once, when it enters the viewport.
 *
 * The final value is rendered server-side, so the number is correct before
 * any script runs and correct for a screen reader reading the page in one
 * pass. The count is decoration applied on top of a true value.
 */
export function CountUp({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const counter = { n: 0 };
      gsap.to(counter, {
        n: value,
        duration: 1.6,
        ease: EASE,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          el.textContent = `${Math.round(counter.n)}${suffix}`;
        },
        onComplete: () => {
          el.textContent = `${value}${suffix}`;
        },
      });
      el.textContent = `0${suffix}`;
    }, el);

    return () => ctx.revert();
  }, [value, suffix]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
