/**
 * The kennel mark — a brass collar tag.
 *
 * The same artifact the whole site is built on: the record card's punched hole
 * and brass tag, reduced to three shapes. Geometry rather than a letterform,
 * so it survives being 16px in a browser tab.
 *
 * The plate takes `currentColor`, which lets the header tint it brass-text on
 * the light ground and brass-bright over the hero without a second copy of the
 * file. The punched details are spruce, matching the ground the mark sits on
 * everywhere it appears.
 */
export function KennelMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="8" y="4.5" width="16" height="23" rx="5" fill="currentColor" />
      <circle cx="16" cy="10" r="2.3" fill="var(--color-spruce, #1e2a23)" />
      <rect
        x="11.25"
        y="16.75"
        width="9.5"
        height="2.1"
        rx="1.05"
        fill="var(--color-spruce, #1e2a23)"
      />
      <rect
        x="12.75"
        y="21.25"
        width="6.5"
        height="2.1"
        rx="1.05"
        fill="var(--color-spruce, #1e2a23)"
        opacity="0.6"
      />
    </svg>
  );
}
