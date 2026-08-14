/**
 * Downscale the vendored placeholder photography.
 *
 *   node scripts/optimise-placeholders.mjs
 *
 * `npm run placeholders` fetches originals straight from Unsplash, and some
 * arrive at over a megabyte — far larger than any slot renders them. Next's
 * image optimiser will resize them, but it pays that cost on the first request
 * for every size variant, which on a cold Vercel deployment is exactly when a
 * real visitor is waiting.
 *
 * Resizing the sources means the optimiser has far less to chew through, and
 * the repo stops carrying megabytes nobody ever sees. Widths are set per slot
 * from how the image is actually used, not from a single global cap.
 */
import sharp from "sharp";
import { readdir, stat, rename } from "node:fs/promises";
import { join } from "node:path";

const DIR = "public/placeholders";

/** Rendered at full viewport width, so they keep the most resolution. */
const FULL_BLEED = new Set([
  "home-hero",
  "about-land",
  "default-contact",
  "default-journal",
  "about-facility",
  "about-family",
]);

const files = (await readdir(DIR)).filter((f) => f.endsWith(".jpg"));
let before = 0;
let after = 0;

for (const file of files) {
  const path = join(DIR, file);
  const key = file.replace(/\.jpg$/, "");
  const width = FULL_BLEED.has(key) ? 1920 : 1100;

  const originalSize = (await stat(path)).size;
  before += originalSize;

  const tmp = `${path}.tmp`;
  await sharp(path)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 78, progressive: true, mozjpeg: true })
    .toFile(tmp);

  const newSize = (await stat(tmp)).size;

  // Never make a file bigger by "optimising" it.
  if (newSize < originalSize) {
    await rename(tmp, path);
    after += newSize;
    console.log(
      `${file.padEnd(26)} ${(originalSize / 1024).toFixed(0)}kB → ${(newSize / 1024).toFixed(0)}kB`,
    );
  } else {
    const { unlink } = await import("node:fs/promises");
    await unlink(tmp);
    after += originalSize;
    console.log(`${file.padEnd(26)} kept (already smaller)`);
  }
}

console.log(
  `\n${(before / 1024 / 1024).toFixed(2)}MB → ${(after / 1024 / 1024).toFixed(2)}MB`,
);
