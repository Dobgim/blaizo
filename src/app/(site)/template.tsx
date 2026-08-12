"use client";

import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * The first render of the session is a page load, not a route change.
 *
 * This flag is read and written inside the layout effect only. A "use client"
 * module is still evaluated during SSR, and its module scope is shared across
 * every request the server handles — so flipping it during render would leave
 * the wipe panel baked into the HTML of every subsequent page, covering the
 * site outright for anyone whose JavaScript never arrives.
 */
let hasNavigated = false;

/**
 * Route change wipe — a spruce panel dropped over the incoming page before
 * it paints, then pulled upward over 420ms.
 *
 * Deliberately short. Nobody should be waiting on a transition to find out
 * whether a puppy is still available.
 */
export default function Template({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isRouteChange = hasNavigated;
    hasNavigated = true;

    if (!isRouteChange || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Runs before paint, so the panel is already covering the new route.
      gsap.set(el, {
        visibility: "visible",
        scaleY: 1,
        transformOrigin: "bottom",
      });
      gsap.to(el, {
        scaleY: 0,
        duration: 0.42,
        ease: "power3.inOut",
        onComplete: () => gsap.set(el, { visibility: "hidden" }),
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Ships invisible. Only the client ever makes it cover anything. */}
      <div
        ref={ref}
        aria-hidden
        className="pointer-events-none invisible fixed inset-0 z-[60] bg-spruce"
      />
      {children}
    </>
  );
}
