/**
 * Import the kennel's own photographs as real dogs and puppies.
 *
 *   1. Save the photographs into  incoming-photos/
 *      Name them so they sort the way you want them used, e.g.
 *        01-dam.jpg  02-sire.jpg  03-puppy.jpg  04-puppy.jpg …
 *   2. Put your admin login in .env.local:
 *        ADMIN_EMAIL=...
 *        ADMIN_PASSWORD=...
 *   3. npm run import:puppies
 *
 * It signs in as you, uploads each photo to Supabase Storage, and creates the
 * dam, the sire, a litter and one puppy per remaining photo — published and
 * live immediately.
 *
 * Your password is read from .env.local and sent only to Supabase. It is never
 * written anywhere, and .env.local is gitignored.
 *
 * Re-running creates a NEW litter rather than editing the old one, so you can
 * import a second litter later without touching the first.
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

// --- configuration -----------------------------------------------------------

const IN = "incoming-photos";

/** Names given to puppies in order. Edit freely; the site shows these. */
const PUPPY_NAMES = [
  "Cocoa", "Hazelnut", "Truffle", "Mocha", "Bramble", "Willow",
  "Acorn", "Juniper", "Maple", "Pepper", "Rowan", "Clover",
];

/** Collar colours, cycled. This is how a family tells them apart. */
const COLLARS = ["Red", "Blue", "Green", "Orange", "Purple", "Yellow", "Pink", "Grey"];

/** Prices in cents, cycled — $750 to $800, so they vary without looking random. */
const PRICES = [75000, 76500, 77500, 78500, 79500, 80000];

/**
 * One description each, so no two cards read identically.
 *
 * These are written as a breeder describes a puppy they have watched for six
 * weeks: a specific habit, not an adjective. Replace them with what is
 * actually true of each puppy — "loves cuddles" is what every listing says and
 * tells a buyer nothing.
 */
const NOTES = [
  "The first to come and say hello, and the last to settle at night. Confident with strangers from the start.",
  "Quiet, watchful, and already the steadiest of the litter around the vacuum cleaner.",
  "The one who works out where the food is kept. Bright, busy, and would suit an active family.",
  "Softest mouth of the litter. Carries a toy everywhere and gives it back when asked.",
  "Biggest of the litter and the calmest with it. Sleeps through anything.",
  "Follows the children about all day. Gentle, and completely unbothered by noise.",
  "Loves water already — first into the shallow end of the pond and reluctant to come out.",
  "Thoughtful and a little reserved at first, then does not leave your side.",
  "Nose to the ground from the moment she wakes. A natural for a shooting home.",
  "Sleeps on her back with her feet in the air. Easy-going with the other dogs.",
  "Comes when called at seven weeks, which is early. Very quick to learn.",
  "The clown of the litter. Endlessly cheerful and slightly clumsy with it.",
];

// --- environment ---------------------------------------------------------------

const env = Object.fromEntries(
  (await readFile(".env.local", "utf8"))
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: key } = env;
const email = env.ADMIN_EMAIL;
const password = env.ADMIN_PASSWORD;

if (!url || !key) {
  console.error("Missing Supabase settings in .env.local.");
  process.exit(1);
}
if (!email || !password) {
  console.error(
    "Add your admin login to .env.local and run again:\n\n" +
      "  ADMIN_EMAIL=you@example.com\n  ADMIN_PASSWORD=your-password\n",
  );
  process.exit(1);
}

if (!existsSync(IN)) {
  console.error(`No ${IN}/ folder. Create it and put the photographs in it.`);
  process.exit(1);
}

const files = (await readdir(IN))
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort();

if (files.length < 3) {
  console.error(
    `Found ${files.length} photo(s) in ${IN}/. Need at least three: a dam, a sire, and one puppy.`,
  );
  process.exit(1);
}

// --- sign in ---------------------------------------------------------------------

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: session, error: authError } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (authError) {
  console.error(`Could not sign in: ${authError.message}`);
  process.exit(1);
}

const { data: adminRow } = await supabase
  .from("admins")
  .select("user_id")
  .eq("user_id", session.user.id)
  .maybeSingle();

if (!adminRow) {
  console.error(
    "Signed in, but this account is not in the `admins` table, so it cannot write.\n" +
      "Run supabase/patch-02-chocolate-and-price.sql, which grants it.",
  );
  process.exit(1);
}

console.log(`Signed in as ${email}. ${files.length} photo(s) to import.\n`);

// --- upload ----------------------------------------------------------------------

/** Resize before upload: phone photos are 3–8MB and no slot renders them that big. */
async function upload(file, width) {
  const body = await sharp(join(IN, file))
    .rotate() // honour EXIF, or portraits arrive sideways
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toBuffer();

  const path = `import/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage
    .from("photos")
    .upload(path, body, { contentType: "image/jpeg", cacheControl: "31536000" });

  if (error) throw new Error(`${file}: ${error.message}`);
  return supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
}

// --- the parents -------------------------------------------------------------------

const stamp = new Date().toISOString().slice(0, 10);
const year = stamp.slice(0, 4);

const damUrl = await upload(files[0], 1200);
const sireUrl = await upload(files[1], 1200);
console.log(`dam   ← ${files[0]}\nsire  ← ${files[1]}`);

async function insertDog(row) {
  const { data, error } = await supabase.from("dogs").insert(row).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}

const damId = await insertDog({
  slug: `dam-${stamp}`,
  name: "Golden Pup's Dam",
  call_name: "Dam",
  sex: "bitch",
  colour: "Chocolate",
  dob: `${Number(year) - 3}-01-01`,
  role: "dam",
  bio: "Mother to this litter. Raised in the house, health tested before the pairing was planned. Edit her name, date of birth and history in the admin panel.",
  hero_image: damUrl,
  hero_alt: "A chocolate Labrador dam lying with her litter.",
  is_published: true,
  sort_order: 1,
});

const sireId = await insertDog({
  slug: `sire-${stamp}`,
  name: "Golden Pup's Sire",
  call_name: "Sire",
  sex: "dog",
  colour: "Chocolate",
  dob: `${Number(year) - 4}-01-01`,
  role: "sire",
  bio: "Father to this litter. Health tested before the pairing was planned. Edit his name, date of birth and history in the admin panel.",
  hero_image: sireUrl,
  hero_alt: "A chocolate Labrador sire standing on open ground.",
  is_published: true,
  sort_order: 2,
});

// --- the litter ----------------------------------------------------------------------

const born = new Date();
born.setDate(born.getDate() - 42); // six weeks old
const ready = new Date(born);
ready.setDate(ready.getDate() + 56); // eight weeks from birth

const { data: litter, error: litterError } = await supabase
  .from("litters")
  .insert({
    code: `L-${stamp}`,
    sire_id: sireId,
    dam_id: damId,
    born_on: born.toISOString().slice(0, 10),
    ready_on: ready.toISOString().slice(0, 10),
    status: "weaning",
    notes: `${files.length - 2} puppies, all chocolate. Correct the dates and this note in the admin panel.`,
    is_published: true,
  })
  .select("id")
  .single();

if (litterError) {
  console.error(`Could not create the litter: ${litterError.message}`);
  process.exit(1);
}

console.log(`litter  L-${stamp}\n`);

// --- the puppies ------------------------------------------------------------------------

const puppyFiles = files.slice(2);

for (const [i, file] of puppyFiles.entries()) {
  const heroUrl = await upload(file, 1100);
  const name = PUPPY_NAMES[i % PUPPY_NAMES.length];
  const price = PRICES[i % PRICES.length];

  const { error } = await supabase.from("puppies").insert({
    litter_id: litter.id,
    slug: `${name.toLowerCase()}-${stamp}`,
    name,
    sex: i % 2 === 0 ? "bitch" : "dog",
    colour: "Chocolate",
    collar_colour: COLLARS[i % COLLARS.length],
    price_cents: price,
    status: "available",
    hero_image: heroUrl,
    hero_alt: `A chocolate Labrador puppy in a ${COLLARS[i % COLLARS.length].toLowerCase()} collar.`,
    notes: NOTES[i % NOTES.length],
    is_published: true,
    sort_order: i + 1,
  });

  if (error) {
    console.log(`  ${file} → FAILED: ${error.message}`);
    continue;
  }

  console.log(
    `  ${file.padEnd(30)} → ${name.padEnd(10)} $${(price / 100).toFixed(0).padStart(3)}  ${COLLARS[i % COLLARS.length]}`,
  );
}

console.log(
  `\nDone. ${puppyFiles.length} puppies live at /puppies.` +
    "\nEdit names, sexes, dates and prices in the admin panel — nothing here is fixed.",
);
