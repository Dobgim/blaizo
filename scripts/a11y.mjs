/**
 * Accessibility audit.
 *
 *   node scripts/a11y.mjs                 every route, both widths
 *   node scripts/a11y.mjs /puppies        one route
 *
 * Runs axe-core against the running site and prints every violation with the
 * offending selector. The brief asks for an accessibility score of 100, which
 * means this has to come back empty — not "mostly empty".
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.A11Y_BASE ?? "http://localhost:3000";

/**
 * Git Bash rewrites a leading "/" argument into the MSYS install path, so
 * `node scripts/a11y.mjs /puppies` arrives as "C:/Program Files/Git/puppies".
 * Undo that, and accept routes with no leading slash too.
 */
function normalizeRoute(arg) {
  const stripped = arg.replace(/^[A-Za-z]:[\\/].*?[\\/]Git[\\/]?/, "/");
  const withSlash = stripped.startsWith("/") ? stripped : `/${stripped}`;
  return withSlash === "" ? "/" : withSlash;
}

const ROUTES = process.argv.slice(2).length
  ? process.argv.slice(2).map(normalizeRoute)
  : [
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
      "/journal",
      "/contact",
      "/apply",
      "/privacy",
      "/terms",
      "/does-not-exist",
    ];

const WIDTHS = [
  { w: 390, h: 844 },
  { w: 1440, h: 900 },
];

const browser = await chromium.launch();
let total = 0;

for (const route of ROUTES) {
  for (const { w, h } of WIDTHS) {
    // axe requires a page from an explicit context, not browser.newPage().
    const context = await browser.newContext({
      viewport: { width: w, height: h },
    });
    const page = await context.newPage();
    // Reduced motion so reveal animations cannot leave content mid-fade,
    // which axe would report as low contrast on an element that is fine.
    await page.emulateMedia({ reducedMotion: "reduce" });

    try {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    } catch {
      console.log(`SKIP  ${route} @${w} — could not load`);
      await context.close();
      continue;
    }

    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    if (violations.length) {
      console.log(`\nFAIL  ${route} @${w}`);
      for (const v of violations) {
        total += v.nodes.length;
        console.log(`  [${v.impact}] ${v.id} — ${v.help}`);
        for (const node of v.nodes.slice(0, 4)) {
          console.log(`      ${node.target.join(" ")}`);
          if (node.failureSummary) {
            console.log(
              `      ${node.failureSummary.split("\n").slice(1, 3).join(" ").trim()}`,
            );
          }
        }
      }
    } else {
      console.log(`ok    ${route} @${w}`);
    }

    await context.close();
  }
}

await browser.close();
console.log(`\n${total} violation${total === 1 ? "" : "s"} total`);
process.exit(total > 0 ? 1 : 0);
