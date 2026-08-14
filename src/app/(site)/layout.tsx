import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { WaitingListPopup } from "@/components/marketing/WaitingListPopup";
import { ShortlistProvider } from "@/components/shortlist/ShortlistProvider";
import { ShortlistDrawer } from "@/components/shortlist/ShortlistDrawer";

/** The public site: marketing chrome and smooth scroll. */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ShortlistProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SmoothScroll />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <WaitingListPopup />
      <ShortlistDrawer />
    </ShortlistProvider>
  );
}
