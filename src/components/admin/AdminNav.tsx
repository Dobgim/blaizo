"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { resources } from "@/lib/admin/resources";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site-config";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  ...resources.map((r) => ({ href: `/admin/${r.key}`, label: r.title })),
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  // The login screen has its own frame; a nav there would be noise.
  if (pathname === "/admin/login") return null;

  async function signOut() {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <header className="border-b border-enamel bg-ledger-bright">
      {/* Stacked on a phone, one row from `md` up. Wrapping all three groups
          into a single flex row put the sign-out button in a different place
          on every screen width, which is the one control you do not want to
          go hunting for. */}
      <div className="shell flex flex-col gap-3 py-3 md:flex-row md:flex-wrap md:items-center md:gap-x-8 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin" className="font-display text-h3 text-spruce">
            {siteConfig.shortName}
            <span className="eyebrow ml-3 text-canvas">Admin</span>
          </Link>

          {/* On a phone these sit up here beside the wordmark, so the section
              links get a full row to themselves below. */}
          <div className="flex items-center gap-5 md:hidden">
            <Link
              href="/"
              target="_blank"
              className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred"
            >
              View site ↗
            </Link>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>

        {/* Scrolls sideways rather than wrapping to three lines on a narrow
            phone. `-mx-*` then `px-*` lets it bleed to the screen edges so a
            scrolled item is never half-hidden under the shell padding. */}
        <nav
          aria-label="Admin sections"
          className="-mx-5 overflow-x-auto px-5 md:mx-0 md:flex-1 md:overflow-visible md:px-0"
        >
          <ul className="flex gap-x-6 gap-y-2 whitespace-nowrap md:flex-wrap">
            {LINKS.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "eyebrow border-b-2 pb-1 transition-colors duration-200",
                      active
                        ? "border-foxred text-foxred"
                        : "border-transparent text-canvas-deep hover:text-spruce",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <Link
            href="/"
            target="_blank"
            className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred"
          >
            View site ↗
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="eyebrow text-canvas-deep transition-colors duration-200 hover:text-foxred disabled:opacity-50"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
