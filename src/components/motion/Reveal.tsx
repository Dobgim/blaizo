"use client";

import { useLayoutEffect, useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { gsap, ScrollTrigger, EASE, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  /** Animate direct children in sequence rather than the wrapper as a whole. */
  stagger?: boolean;
  /** Seconds between children. The house value is 60ms. */
  staggerAmount?: number;
  delay?: number;
  as?: ElementType;
  className?: string;
};

/**
 * Section reveal: 24px rise and fade, fired once at 20% into the viewport.
 *
 * The hidden state is applied in JS, never in the markup or a stylesheet.
 * If JavaScript fails or is switched off, the content is simply there —
 * nothing on this site is invisible waiting for a script to release it.
 *
 * Fires once and self-kills, so scrolling back up never re-animates.
 */
export function Reveal({
  children,
  stagger = false,
  staggerAmount = 0.06,
  delay = 0,
  as: Tag = "div",
  className,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const targets: Element[] = stagger ? Array.from(el.children) : [el];
    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      // Set the hidden state before paint so there is no flash of content.
      gsap.set(targets, { opacity: 0, y: 24 });

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: EASE,
        delay,
        stagger: stagger ? staggerAmount : 0,
        scrollTrigger: {
          trigger: el,
          start: "top 80%", // 20% into the viewport
          once: true,
        },
      });
    }, el);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [stagger, staggerAmount, delay]);

  return (
    <Tag ref={ref} data-reveal className={className}>
      {children}
    </Tag>
  );
}
