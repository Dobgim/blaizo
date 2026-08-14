import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotFoundContent } from "@/components/layout/NotFoundContent";
import { ShortlistProvider } from "@/components/shortlist/ShortlistProvider";
import { ShortlistDrawer } from "@/components/shortlist/ShortlistDrawer";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * The global 404, for URLs that match no route at all.
 *
 * This has to live at the app root — a not-found.tsx inside the (site) route
 * group only covers notFound() calls raised within that tree, and unmatched
 * URLs fall through to Next's stock page instead. So the chrome is assembled
 * here by hand rather than inherited.
 *
 * No SmoothScroll: Lenis on a single-screen error page buys nothing, and a
 * visitor who has just hit a dead end should not wait for a scroll library.
 */
export default function NotFound() {
  /* The provider is required, not optional: the header this page assembles
     renders the shortlist count, which reads that context. Without it the
     page throws at prerender. It also means a visitor who lands here keeps
     the list they had built up. */
  return (
    <ShortlistProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <NotFoundContent />
      </main>
      <Footer />
      <ShortlistDrawer />
    </ShortlistProvider>
  );
}
