"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { resources } from "@/lib/admin/resources";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site-config";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/applications", label: "Applications" },
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
      <div className="shell flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
        <Link href="/admin" className="font-display text-h3 text-spruce">
          {siteConfig.shortName}
          <span className="eyebrow ml-3 text-canvas">Admin</span>
        </Link>

        <nav aria-label="Admin sections" className="flex-1">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
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

        <div className="flex items-center gap-5">
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
