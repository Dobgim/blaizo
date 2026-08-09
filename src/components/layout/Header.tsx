"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/ui/Wordmark";
import { ButtonLink } from "@/components/ui/Button";
import { primaryNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site-config";

/**
 * Transparent over a hero photograph, solid after 80px of scroll.
 *
 * Whether a page has a hero is decided by the page itself: it renders an
 * element carrying `data-hero`. Pages without one get a solid header from
 * first paint, which is what the interior process pages want.
 */
export function Header() {
  const pathname = usePathname();
  const [hasHero, setHasHero] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHasHero(document.querySelector("[data-hero]") !== null);

    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Route change closes everything.
  useEffect(() => {
    setMenuOpen(false);
    setOpenSection(null);
  }, [pathname]);

  // Escape closes the drawer or an open dropdown.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenSection(null);
      setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock the page behind the mobile drawer.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const transparent = hasHero && !scrolled && !menuOpen;

  const openWithDelay = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenSection(label);
  };
  const closeWithDelay = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenSection(null), 120);
  };

  return (
    <header
      data-motion="header"
      className={[
        "fixed inset-x-0 top-0 z-50",
        "transition-[background-color,border-color,height] duration-300",
        transparent
          ? "on-dark border-b border-transparent bg-transparent"
          : "border-b border-enamel bg-ledger",
      ].join(" ")}
    >
      <div
        className={[
          "shell flex items-center justify-between",
          "transition-[height] duration-300",
          transparent ? "h-24" : "h-16",
        ].join(" ")}
      >
        <Wordmark onDark={transparent} compact={!transparent} />

        {/* ---------- Desktop navigation ---------- */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 lg:flex"
        >
          {primaryNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const isOpen = openSection === item.label;

            if (!item.children) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={navLinkClass(transparent, active)}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => openWithDelay(item.label)}
                onMouseLeave={closeWithDelay}
                onFocus={() => openWithDelay(item.label)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    closeWithDelay();
                  }
                }}
              >
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  aria-expanded={isOpen}
                  className={navLinkClass(transparent, active)}
                >
                  {item.label}
                </Link>

                <div
                  className={[
                    "absolute left-0 top-full min-w-56 border border-enamel bg-ledger-bright",
                    "transition-opacity duration-200",
                    isOpen
                      ? "visible opacity-100"
                      : "invisible opacity-0",
                  ].join(" ")}
                >
                  <ul className="py-2">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block px-5 py-2.5 text-small text-spruce transition-colors duration-200 hover:bg-ledger-deep hover:text-foxred"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={siteConfig.contact.phoneHref}
            className={[
              "eyebrow hidden transition-colors duration-300 xl:inline-block",
              transparent
                ? "text-ledger/85 hover:text-brass-bright"
                : "text-canvas hover:text-foxred",
            ].join(" ")}
          >
            {siteConfig.contact.phone}
          </a>

          <ButtonLink
            href="/apply"
            variant={transparent ? "onDark" : "solid"}
            className="hidden sm:inline-flex"
          >
            Apply
          </ButtonLink>

          {/* ---------- Drawer toggle ---------- */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={[
              "flex h-11 w-11 items-center justify-center lg:hidden",
              transparent ? "text-ledger" : "text-spruce",
            ].join(" ")}
          >
            <span className="sr-only">
              {menuOpen ? "Close menu" : "Open menu"}
            </span>
            <span aria-hidden className="flex w-6 flex-col gap-[5px]">
              <span
                className={[
                  "h-px w-full bg-current transition-transform duration-300",
                  menuOpen ? "translate-y-[6px] rotate-45" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "h-px w-full bg-current transition-opacity duration-200",
                  menuOpen ? "opacity-0" : "opacity-100",
                ].join(" ")}
              />
              <span
                className={[
                  "h-px w-full bg-current transition-transform duration-300",
                  menuOpen ? "-translate-y-[6px] -rotate-45" : "",
                ].join(" ")}
              />
            </span>
          </button>
        </div>
      </div>

      {/* ---------- Mobile drawer ---------- */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="on-dark fixed inset-x-0 top-16 bottom-0 overflow-y-auto bg-spruce lg:hidden"
      >
        <nav aria-label="Primary mobile" className="shell py-10">
          <ul className="flex flex-col">
            {primaryNav.map((item) => (
              <li key={item.href} className="hairline-dark py-5 first:border-t-0 first:pt-0">
                <Link
                  href={item.href}
                  className="font-display text-[1.75rem] leading-none text-ledger transition-colors duration-200 hover:text-brass-bright"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <ul className="mt-4 flex flex-col gap-2.5 pl-5">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="eyebrow text-enamel transition-colors duration-200 hover:text-brass-bright"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <div className="hairline-dark mt-8 flex flex-col gap-4 pt-8">
            <ButtonLink href="/apply" variant="onDark" size="lg">
              Apply for a puppy
            </ButtonLink>
            <a
              href={siteConfig.contact.phoneHref}
              className="eyebrow text-brass-bright"
            >
              Call {siteConfig.contact.phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

function navLinkClass(transparent: boolean, active: boolean) {
  return [
    "inline-block px-3.5 py-2 text-small transition-colors duration-300",
    transparent
      ? active
        ? "text-brass-bright"
        : "text-ledger/90 hover:text-brass-bright"
      : active
        ? "text-foxred"
        : "text-spruce hover:text-foxred",
  ].join(" ");
}
