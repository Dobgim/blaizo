"use client";

/**
 * The boundary for failures in the root layout itself.
 *
 * Next replaces the entire document when this renders, so it has to supply
 * its own <html> and <body> — and it cannot rely on the app's fonts, providers
 * or stylesheet having loaded, since a failure in the layout is exactly the
 * case where they have not. Hence the inline styles: this file must not depend
 * on anything that could be the thing that broke.
 *
 * `src/app/(site)/error.tsx` handles everything reachable inside the site
 * shell, which is almost all of it. This one should effectively never appear.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#dfe0d8",
          color: "#1e2a23",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <h1 style={{ fontSize: "1.75rem", margin: 0, fontWeight: 400 }}>
            Golden Pup Kennel
          </h1>
          <p style={{ marginTop: "1.25rem", lineHeight: 1.6 }}>
            The site failed to load. Nothing you did caused it. Please try
            again, or call or text us on (202) 643-8872 and we will help you
            directly.
          </p>
          <p style={{ marginTop: "1.75rem" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                font: "inherit",
                cursor: "pointer",
                background: "none",
                border: 0,
                borderBottom: "1px solid #a9843f",
                padding: "0 0 0.25rem",
                color: "inherit",
              }}
            >
              Try again
            </button>
          </p>
          {error.digest && (
            <p style={{ marginTop: "2rem", fontSize: "0.75rem", opacity: 0.7 }}>
              Reference {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
