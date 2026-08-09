"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * One registration point. GSAP and ScrollTrigger are the only animation
 * libraries in the build; Lenis handles scrolling and nothing else.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

/** The site's one easing curve for entrances. */
export const EASE = "power3.out";
/** Interaction easing — hovers, tags, seals. */
export const EASE_HOVER = "power2.out";

/**
 * True when the visitor has asked for reduced motion.
 *
 * Every motion component checks this and returns early rather than
 * animating with a shorter duration. Transform-based motion does not happen
 * at all; opacity transitions in CSS carry the intent instead.
 */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
