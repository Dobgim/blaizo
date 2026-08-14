/**
 * Screenshot harness for the design critique loop.
 *
 *   node scripts/shoot.mjs /                       full page, both widths
 *   node scripts/shoot.mjs /puppies --at 1440
 *   node scripts/shoot.mjs / --scroll 900          scrolled, viewport only
 *
 * Writes into .shots/, which is gitignored.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

// Port 3100 by default: 3000 is routinely taken by another project, and a
// silent fallback means you photograph somebody else's site.
// Run the dev server with `npx next dev -p 3100`.
const BASE = process.env.SHOOT_BASE ?? "http://localhost:3100";
const OUT = ".shots";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? null : args[i + 1];
};

// Positional args are anything that is neither a flag nor a flag's value.
const flagValueIndexes = new Set(
  args.flatMap((a, i) => (a.startsWith("--") ? [i + 1] : [])),
);
// Git Bash rewrites a bare "/" argument into a Windows path, so routes may
// be passed without the leading slash: `node scripts/shoot.mjs puppies`.
// Git Bash rewrites a leading "/" into the MSYS install path, so a bare "/"
// arrives as "C:/Program Files/Git". Undo that before anything else, or you
// photograph a 404 and name the file after your Git installation.
const rawRoute =
  args.find((a, i) => !a.startsWith("--") && !flagValueIndexes.has(i)) ?? "/";
const unmangled = rawRoute.replace(/^[A-Za-z]:[\\/].*?[\\/]Git[\\/]?/, "/");
const route = unmangled.startsWith("/") ? unmangled : `/${unmangled}`;

const only = flag("at");
const scrollTo = flag("scroll") ? Number(flag("scroll")) : null;

const widths = only
  ? [{ w: Number(only), h: 900, label: only }]
  : [
      { w: 390, h: 844, label: "390" }, // most of this traffic is phones
      { w: 1440, h: 900, label: "1440" },
    ];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const slug = route.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home";

for (const { w, h, label } of widths) {
  const page = await browser.newPage({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
  });
  // "load", not "networkidle": a slow remote placeholder image should not
  // hang the capture. Images are waited on explicitly below, with a cap.
  await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 60_000 });
  // Let fonts settle so type is never captured mid-swap, and let every
  // image decode — a hero caught before its photograph paints reads as a
  // black box and sends you chasing a bug that isn't there.
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    const pending = Array.from(document.images).filter((img) => !img.complete);
    const settled = Promise.all(
      pending.map(
        (img) =>
          new Promise((r) => {
            img.addEventListener("load", r, { once: true });
            img.addEventListener("error", r, { once: true });
          }),
      ),
    );
    return Promise.race([
      settled,
      new Promise((r) => setTimeout(r, 25_000)),
    ]);
  });
  // The page-load timeline runs to ~1.5s. Clear it before capturing.
  await page.waitForTimeout(2200);

  // A fullPage capture does not scroll, so scroll-triggered reveals would
  // photograph blank. Walk the page first, then return to the top.
  if (scrollTo === null) {
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.75;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 220));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(900);
  }

  let suffix = "";
  if (scrollTo !== null) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollTo);
    await page.waitForTimeout(700);
    suffix = `-scroll${scrollTo}`;
  }

  const file = `${OUT}/${slug}-${label}${suffix}.png`;
  await page.screenshot({ path: file, fullPage: scrollTo === null });
  console.log(file);
  await page.close();
}

await browser.close();
