"use client";

import { useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

/**
 * The last line of defence on the public site.
 *
 * Without a boundary here, any client-side throw replaces the whole page with
 * the browser's own "Application error: a client-side exception has occurred",
 * which tells a visitor nothing and looks like a site that has fallen over. On
 * a kennel where the visitor is already deciding whether these people are
 * real, that is the most expensive possible failure mode.
 *
 * One case is handled rather than reported: a deployment that lands while
 * someone has the site open leaves their browser holding the previous build's
 * JavaScript, whose server-action ids no longer exist on the server. The throw
 * is `UnrecognizedActionError`, it is not a bug, and it is cured by fetching
 * the page again. So we do that automatically — once, guarded, because a
 * reload loop is worse than the error it is trying to fix.
 */

const RELOAD_GUARD = "goldenpup:stale-reload";

function isStaleDeployment(error: Error): boolean {
  const text = `${error.name} ${error.message}`;
  return (
    text.includes("UnrecognizedActionError") ||
    text.includes("Failed to find Server Action") ||
    text.includes("was not found on the server")
  );
}

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const stale = isStaleDeployment(error);

  useEffect(() => {
    if (!stale) {
      console.error("[site] unhandled client error:", error);
      return;
    }

    /* sessionStorage, not state: the whole point is to survive the reload we
       are about to trigger, so a second failure shows the page instead of
       reloading again. */
    let alreadyTried = false;
    try {
      alreadyTried = window.sessionStorage.getItem(RELOAD_GUARD) === "1";
      window.sessionStorage.setItem(RELOAD_GUARD, "1");
    } catch {
      /* Storage blocked. Fall through to the manual path below rather than
         risk an unguarded loop. */
      alreadyTried = true;
    }

    if (!alreadyTried) window.location.reload();
  }, [error, stale]);

  return (
    <section className="shell flex min-h-[70vh] items-center py-24">
      <div className="mx-auto max-w-[34rem] text-center">
        <p className="eyebrow text-canvas-deep">
          {stale ? "Updating" : "Something went wrong"}
        </p>

        <h1 className="mt-4 font-display text-h2 text-spruce">
          {stale
            ? "We just updated the site"
            : "This page did not load properly"}
        </h1>

        <p className="measure mx-auto mt-5 text-body text-canvas-deep">
          {stale
            ? "You had an older version of the page open. Reloading should put it right — if it does not, close the tab and come back."
            : "Nothing you did caused this, and nothing has been lost. Try again, and if it keeps happening call or text us and we will sort it out by hand."}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <button
            type="button"
            onClick={() => {
              try {
                window.sessionStorage.removeItem(RELOAD_GUARD);
              } catch {
                /* Nothing to clear. */
              }
              reset();
            }}
            className="border-b border-brass pb-1 text-body text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border-b border-brass pb-1 text-body text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
          >
            Back to the home page
          </Link>
          <a
            href={siteConfig.contact.phoneHref}
            className="border-b border-brass pb-1 text-body text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
          >
            {siteConfig.contact.phone}
          </a>
        </div>

        {error.digest && (
          <p className="mt-8 font-mono text-micro text-canvas">
            Reference {error.digest}
          </p>
        )}
      </div>
    </section>
  );
}
