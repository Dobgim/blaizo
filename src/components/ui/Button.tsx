import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "solid" | "outline" | "onDark" | "quiet";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-[2px] font-body font-medium " +
  "transition-[background-color,color,border-color] duration-300 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  /* Primary action on a light ground. */
  solid: "bg-spruce text-ledger hover:bg-foxred",
  /* Secondary action on a light ground. */
  outline:
    "border border-spruce text-spruce hover:bg-spruce hover:text-ledger",
  /* Primary action on a photograph or a spruce band. */
  onDark: "bg-ledger text-spruce hover:bg-brass-bright hover:text-spruce",
  /* Inline text action — brass rule underneath instead of a box. */
  quiet:
    "px-0 border-b border-brass pb-1 text-spruce hover:border-foxred hover:text-foxred",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-6 text-small",
  lg: "h-14 px-8 text-body",
};

/** Exported so non-Link anchors (the WhatsApp hand-off) can match exactly. */
export function buttonClasses(
  variant: Variant = "solid",
  size: Size = "md",
  className?: string,
) {
  return classes(variant, size, className);
}

function classes(variant: Variant, size: Size, className?: string) {
  return [
    base,
    variants[variant],
    variant === "quiet" ? "h-auto text-body" : sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "solid",
  size = "md",
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <button className={classes(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "solid",
  size = "md",
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={classes(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
