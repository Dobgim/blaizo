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
export function StatusSeal({ status }: { status: PuppyStatus }) {
  const { label, className } = seal[status];

  return (
    <span
      className={[
        "eyebrow inline-block -rotate-3 border-2 px-3 py-1.5 mix-blend-multiply",
        "transition-transform duration-[400ms] ease-out-quad",
        "group-hover:-rotate-1",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
