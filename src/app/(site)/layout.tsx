import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

/** The public site: marketing chrome and smooth scroll. */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SmoothScroll />
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
