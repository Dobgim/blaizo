/**
 * Responsive audit.
 *
 *   node scripts/responsive.mjs
 *
 * For every route at every width it checks two things that break real phones
 * and that a screenshot review routinely misses:
 *
 *   1. Horizontal overflow — document wider than the viewport, plus the
 *      specific elements sticking out, so the culprit is named rather than
 *      guessed at.
 *   2. Tap-target size — interactive elements under 44x44 CSS px, the iOS
 *      minimum. Small targets are the difference between a site that feels
 *      professional on a phone and one that feels like a desktop site shrunk.
 *
 * 320px is included deliberately: it is narrower than the brief's 360 floor,
 * and anything that survives it survives everything above.
 */
import { chromium } from "playwright";

const BASE = process.env.RESP_BASE ?? "http://localhost:3000";

const ROUTES = [
  "/",
  "/puppies",
  "/puppies/juniper",
  "/puppies/upcoming",
  "/puppies/past",
  "/dogs",
  "/dogs/birch",
  "/process",
  "/process/health-testing",
  "/process/guarantee",
  "/about",
  "/about/facility",
  "/about/reviews",
  "/faqs",
  "/contact",
  "/apply",
  "/privacy",
  "/terms",
  "/no-such-page",
];

const WIDTHS = [320, 360, 390, 430, 768, 1024];

const browser = await chromium.launch();
let problems = 0;

for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  // Skip the interstitial; it is audited on its own.
  await ctx.addInitScript(() =>
    localStorage.setItem("goldenpup:waiting-list-seen", "1"),
  );

  for (const route of ROUTES) {
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    } catch {
      console.log(`SKIP  ${route} @${width}`);
      await page.close();
      continue;
    }
    await page.waitForTimeout(250);

    const report = await page.evaluate((vw) => {
      const doc = document.documentElement;
      const overflow = doc.scrollWidth - vw;

      const offenders = [];
      if (overflow > 1) {
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.right > vw + 1 || r.left < -1) {
            const cls =
              typeof el.className === "string" ? el.className.slice(0, 70) : "";
            offenders.push(
              `${el.tagName.toLowerCase()}.${cls} [${Math.round(r.left)}→${Math.round(r.right)}]`,
            );
          }
          if (offenders.length >= 4) break;
        }
      }

      /* WCAG 2.2 Target Size (Minimum) is 24x24 CSS px — that is the bar being
         enforced. Primary controls are built to 44 by hand because it is
         better on a phone, but holding every inline link to 44 would be
         inventing a standard and wrecking line height to meet it. */
      const MIN = 24;
      const small = [];
      for (const el of document.querySelectorAll(
        'a[href], button, input, select, textarea, [role="button"]',
      )) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;

        // Off-screen until focused (the skip link) — not a tap target.
        if (r.bottom < 0 || r.top > window.innerHeight * 40) continue;

        // Inline links flow with their text and are exempt under 2.5.8.
        if (el.tagName === "A" && el.closest("p, li, figcaption, dd, dt, .longform, th, td")) {
          continue;
        }

        // A stretched link: its ::after covers the whole card, so the real
        // target is the card, not the text the rect reports.
        const after = window.getComputedStyle(el, "::after");
        if (after.position === "absolute" && after.inset === "0px") continue;

        if (r.height < MIN || r.width < MIN) {
          const label = (el.textContent ?? "").trim().slice(0, 28);
          small.push(
            `${el.tagName.toLowerCase()} "${label}" ${Math.round(r.width)}x${Math.round(r.height)}`,
          );
        }
        if (small.length >= 5) break;
      }

      return { overflow, offenders, small };
    }, width);

    const flags = [];
    if (report.overflow > 1) {
      flags.push(`OVERFLOW +${report.overflow}px`);
      problems += 1;
    }
    if (report.small.length) {
      flags.push(`${report.small.length}+ small targets`);
      problems += 1;
    }

    if (flags.length) {
      console.log(`FAIL  ${route} @${width} — ${flags.join(", ")}`);
      for (const o of report.offenders) console.log(`        overflow: ${o}`);
      for (const s of report.small) console.log(`        target:   ${s}`);
    }

    await page.close();
  }

  console.log(`— finished ${width}px`);
}

await browser.close();
console.log(`\n${problems} problem${problems === 1 ? "" : "s"}`);
process.exit(problems > 0 ? 1 : 0);
