import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The home-screen icon.
 *
 * iOS ignores SVG favicons and squares off whatever it is given, so this is a
 * PNG generated at 180px with the mark scaled up and given more breathing room
 * than the 32px version — at that size the tag can carry its engraved rules
 * without them closing up.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e2a23",
        }}
      >
        <svg width="132" height="132" viewBox="0 0 32 32">
          <rect x="8" y="4.5" width="16" height="23" rx="5" fill="#b8934c" />
          <circle cx="16" cy="10" r="2.3" fill="#1e2a23" />
          <rect
            x="11.25"
            y="16.75"
            width="9.5"
            height="2.1"
            rx="1.05"
            fill="#1e2a23"
          />
          <rect
            x="12.75"
            y="21.25"
            width="6.5"
            height="2.1"
            rx="1.05"
            fill="#1e2a23"
            opacity="0.6"
          />
        </svg>
      </div>
    ),
    size,
  );
}
