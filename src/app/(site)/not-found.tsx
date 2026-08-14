import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * Reached by notFound() inside the site tree — a puppy or dog slug that does
 * not exist. Picks up the header and footer from the (site) layout.
 *
 * Unmatched URLs never get here: Next only uses app/not-found.tsx for those,
 * which is why the root has its own copy.
 */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
