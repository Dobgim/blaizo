import type { PuppyStatus } from "@/lib/types";

const seal: Record<PuppyStatus, { label: string; className: string }> = {
  available: {
    label: "Available",
    className: "border-foxred text-foxred",
  },
  reserved: {
    /* brass-text, not brass: the seal is a word before it is an ornament,
       and #a9843f cannot carry 12px type at 4.5:1 on any of our grounds. */
    label: "Reserved",
    className: "border-brass-text text-brass-text",
  },
  placed: {
    label: "Placed",
    className: "border-canvas text-canvas",
  },
};

/**
 * A stamped status seal — pressed by hand, so it sits off true.
 *
 * `multiply` blending lets the card face show through the way ink on paper
 * does. The rotation is decoration; the label is real text, read normally by
 * a screen reader in the flow of the card.
 */
export function StatusSeal({
  status,
  compact = false,
}: {
  status: PuppyStatus;
  /**
   * Tighter below `sm`.
   *
   * A seal is as wide as its word plus 24px of padding, and it is rotated. On
   * a 110px card in a three-up grid that puts the corners outside the card
   * border, which reads as a mistake rather than as a hand-pressed stamp.
   */
  compact?: boolean;
}) {
  const { label, className } = seal[status];

  return (
    <span
      className={[
        "eyebrow inline-block -rotate-3 border-2 mix-blend-multiply",
        compact ? "px-1.5 py-1 sm:px-3 sm:py-1.5" : "px-3 py-1.5",
        "transition-transform duration-[400ms] ease-out-quad",
        "group-hover:-rotate-1",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
