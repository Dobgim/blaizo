/**
 * Install the owner's own puppy photographs.
 *
 *   1. Save the photos into  incoming-photos/
 *   2. node scripts/install-puppy-photos.mjs
 *
 * Files are taken in filename order, resized, and written over the placeholder
 * slots the site already renders. Nothing else has to change: the slots are
 * referenced by name throughout, so replacing the file is the whole job.
 *
 * This is for the initial seed only. Day to day the owner uploads through the
 * admin panel, which puts photos in Supabase Storage instead of the repo.
 */
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const IN = "incoming-photos";
const OUT = "public/placeholders";

/* Which slot each incoming photo becomes, in order. Portrait shots suit the
   record cards; the wide ones suit the full-bleed bands. */
const SLOTS = [
  { name: "default-puppy", width: 1100, note: "puppy card default" },
  { name: "dog-sire", width: 1100, note: "sire card" },
  { name: "dog-dam-one", width: 1100, note: "first dam card" },
  { name: "dog-dam-two", width: 1100, note: "second dam card" },
  { name: "default-dog", width: 1100, note: "fallback dog card" },
  { name: "about-land", width: 1920, note: "About page band" },
  { name: "home-hero", width: 1920, note: "home page hero" },
  { name: "home-testimonial", width: 1200, note: "placement letter photo" },
  { name: "default-journal", width: 1600, note: "journal cover" },
];

if (!existsSync(IN)) {
  await mkdir(IN, { recursive: true });
  console.log(`Created ${IN}/ — put the photographs in there and run again.`);
  process.exit(0);
}

const files = (await readdir(IN))
  .filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f))
  .sort();

if (files.length === 0) {
  console.log(`No images found in ${IN}/. Save the photographs there first.`);
  process.exit(0);
}

console.log(`${files.length} photo(s) found.\n`);

for (const [i, file] of files.entries()) {
  const slot = SLOTS[i];
  if (!slot) {
    console.log(`${file} → skipped (only ${SLOTS.length} slots exist)`);
    continue;
  }

  await sharp(join(IN, file))
    .rotate() // honour the phone's EXIF orientation, or portraits arrive sideways
    .resize({ width: slot.width, withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(join(OUT, `${slot.name}.jpg`));

  console.log(`${file.padEnd(34)} → ${slot.name}.jpg   (${slot.note})`);
}

console.log(
  "\nDone. Rebuild to see them:  npm run build && npm start" +
    "\nIf an old image lingers, clear .next/cache/images first.",
);
