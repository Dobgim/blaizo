import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Admin",
  /* The admin panel must never be indexed, regardless of what the root layout
     says. This overrides it for every page in the tree. */
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The admin shell.
 *
 * Deliberately plainer than the public site: no Lenis, no reveal animations,
 * no display face at large sizes. Somebody using this on a Sunday evening
 * wants density and speed, not choreography.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!isSupabaseConfigured) {
    return (
      <main className="shell flex min-h-screen items-center py-24">
        <div className="max-w-[60ch]">
          <p className="eyebrow text-foxred">Not configured</p>
          <h1 className="mt-4 text-h2 text-spruce">
            The admin panel needs a Supabase project
          </h1>
          <p className="mt-4 text-body text-canvas-deep">
            Set <code className="font-mono text-data">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            and{" "}
            <code className="font-mono text-data">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            in your environment, run the migrations in{" "}
            <code className="font-mono text-data">supabase/migrations</code>, and
            reload this page. The public site works without them — it falls back
            to the demonstration records.
          </p>
          <p className="mt-6">
            <Link
              href="/"
              className="border-b border-brass pb-1 text-body text-spruce hover:border-foxred hover:text-foxred"
            >
              Back to the website
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-ledger">
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>
      <AdminNav />
      <main id="admin-main" className="shell py-10 lg:py-14">
        {children}
      </main>
    </div>
  );
}
