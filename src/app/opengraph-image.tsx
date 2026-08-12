import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} — health-tested ${siteConfig.breed}s`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The default share card.
 *
 * Drawn as a stamped record rather than a photograph with text over it: a
 * shared link should look like the site it came from, and the site's whole
 * language is a card index. Uses system faces — loading three webfonts into
 * an edge function to render one image is not a trade worth making.
 */
export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#dfe0d8",
          padding: 72,
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Brass rule across the head, as on every card. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: "#a9843f",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "monospace",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#6e6448",
            }}
          >
            Est. {siteConfig.establishedYear} · {siteConfig.contact.region}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 82,
              lineHeight: 1.02,
              color: "#1e2a23",
              maxWidth: 900,
            }}
          >
            {siteConfig.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: "1px solid #afb8b0",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 40, color: "#1e2a23" }}>
              {siteConfig.name}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 10,
                fontFamily: "monospace",
                fontSize: 20,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#6e6448",
              }}
            >
              Hips · Elbows · Eyes · DNA panel
            </div>
          </div>

          {/* The stamped seal, at its slight hand-pressed angle. */}
          <div
            style={{
              display: "flex",
              border: "3px solid #7a3b24",
              color: "#7a3b24",
              padding: "12px 26px",
              fontFamily: "monospace",
              fontSize: 26,
              letterSpacing: 5,
              textTransform: "uppercase",
              transform: "rotate(-3deg)",
            }}
          >
            Certified
          </div>
        </div>
      </div>
    ),
    size,
  );
}
