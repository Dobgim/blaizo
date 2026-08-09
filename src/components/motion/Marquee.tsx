"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * A slow ribbon of clearances and registries. Pauses on hover and on focus.
 *
 * The list is duplicated for the seamless loop; the copy is aria-hidden so a
 * screen reader hears each clearance once. Under reduced motion it does not
 * move — it renders as a static wrapped list, which is honestly better.
 */
export function Marquee({
  items,
  speed = 55,
}: {
  items: readonly string[];
  /** Seconds for one full pass. Slower reads as more confident. */
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      tweenRef.current = gsap.to(track, {
        xPercent: -50,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    }, track);

    return () => ctx.revert();
  }, [speed]);

  const pause = () => tweenRef.current?.pause();
  const play = () => tweenRef.current?.play();

  const Row = ({ hidden }: { hidden?: boolean }) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-10 pr-10 motion-reduce:flex-wrap"
    >
      {items.map((item) => (
        <li
          key={item}
          className="eyebrow flex shrink-0 items-center gap-10 text-brass-bright"
        >
          {item}
          <span aria-hidden className="text-spruce-line">
            /
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className="overflow-hidden py-5"
      onMouseEnter={pause}
      onMouseLeave={play}
      onFocusCapture={pause}
      onBlurCapture={play}
    >
      <div ref={trackRef} className="flex w-max motion-reduce:w-full">
        <Row />
        <div className="motion-reduce:hidden">
          <Row hidden />
        </div>
      </div>
    </div>
  );
}
