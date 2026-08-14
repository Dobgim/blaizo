/**
 * Curated import of the kennel's own photographs.
 *
 *   node scripts/curate-photos.mjs
 *
 * Unlike import-puppies.mjs, which takes files in filename order, this uses an
 * explicit manifest. The folder contained sixteen photographs of three
 * different things — chocolate Labradors, yellow Labradors, and five Cane
 * Corso puppies — and position alone cannot tell them apart.
 *
 * Two rules decided the selection:
 *
 *   * No Cane Corsos. They are a mastiff, not a retriever. On a site whose
 *     whole argument is "we know exactly what we breed, here is the
 *     paperwork", a mastiff in the Labrador gallery is the detail that makes a
 *     careful buyer leave.
 *   * Chocolate for the dogs and puppies, since that is what the kennel
 *     breeds. The yellow puppies appear only in the lifestyle photographs —
 *     a child with a puppy — where the point is the family, not the pedigree.
 *
 * It writes the site's own placeholder slots AND creates live database records
 * through the admin account.
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const IN = "incoming-photos";
const OUT = "public/placeholders";

// --- what each photograph is, by index in sorted filename order ----------------

/** Repo placeholder slots: file on disk, replaced in place. */
const SITE_SLOTS = [
  { i: 5, slot: "home-hero", width: 1920, note: "four chocolate puppies in grass" },
  { i: 0, slot: "home-whelping", width: 1400, note: "the dam nursing her litter" },
  { i: 11, slot: "home-testimonial", width: 1200, note: "a boy and his puppy" },
  { i: 7, slot: "about-land", width: 1920, note: "boy and puppy, wide" },
  { i: 12, slot: "default-puppy", width: 1100, note: "single chocolate puppy" },
  { i: 14, slot: "default-dog", width: 1100, note: "two chocolate puppies" },
  { i: 9, slot: "default-journal", width: 1600, note: "chocolate litter in grass" },
];

/** The dam. There is no photograph of an adult male, so no sire is created. */
const DAM = { i: 0, alt: "The chocolate Labrador dam lying on a blanket, nursing her litter." };

/** One database puppy per entry. Chocolate only. */
const PUPPIES = [
  { i: 12, name: "Cocoa",  sex: "bitch", collar: "Red",    price: 75000,
    note: "The one who lies down where she can see everybody. Watchful, unhurried, and the first of the litter to settle at night.",
    alt: "A chocolate Labrador puppy lying in cut grass, looking up at the camera." },
  { i: 14, name: "Truffle", sex: "dog",  collar: "Blue",   price: 76500,
    note: "Never far from his sister. Plays hard for twenty minutes then sleeps in a heap with whoever is nearest.",
    alt: "Two chocolate Labrador puppies together in grass." },
  { i: 5,  name: "Bramble", sex: "dog",  collar: "Green",  price: 77500,
    note: "The climber. If there is something to stand on he is already on it, and he brings the whole litter with him.",
    alt: "Four chocolate Labrador puppies in grass, one climbing over the others." },
  { i: 9,  name: "Hazelnut", sex: "bitch", collar: "Orange", price: 78500,
    note: "Comes to a whistle already, which is early. Bright, and interested in whatever you are doing.",
    alt: "A group of chocolate Labrador puppies in long grass." },
  { i: 8,  name: "Mocha",  sex: "bitch", collar: "Purple", price: 79500,
    note: "Sleeps through anything, including the wagon ride. The steadiest of the litter around noise.",
    alt: "Chocolate Labrador puppies asleep together in a red wagon." },
  { i: 2,  name: "Willow", sex: "bitch", collar: "Yellow", price: 80000,
    note: "Smallest at birth and now the boldest. First to the door, first to the food, first to say hello.",
    alt: "A chocolate Labrador puppy beside her littermates." },
];

// --- environment ------------------------------------------------------------------

const env = Object.fromEntries(
  (await readFile(".env.local", "utf8"))
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const files = (await readdir(IN)).filter((f) => /\.jpe?g$/i.test(f)).sort();
const src = (i) => join(IN, files[i]);

// --- 1. the site's own placeholder files ---------------------------------------------

console.log("Site photography\n");
for (const { i, slot, width, note } of SITE_SLOTS) {
  await sharp(src(i))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(join(OUT, `${slot}.jpg`));
  console.log(`  ${slot.padEnd(18)} ← ${note}`);
}

// --- 2. the database ------------------------------------------------------------------

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const { data: session, error: authError } = await supabase.auth.signInWithPassword({
  email: env.ADMIN_EMAIL,
  password: env.ADMIN_PASSWORD,
});
if (authError) {
  console.error(`\nCould not sign in: ${authError.message}`);
  process.exit(1);
}

const { data: isAdmin } = await supabase
  .from("admins")
  .select("user_id")
  .eq("user_id", session.user.id)
  .maybeSingle();
if (!isAdmin) {
  console.error("\nSigned in, but this account is not in `admins`, so it cannot write.");
  process.exit(1);
}

async function upload(i, width) {
  const body = await sharp(src(i))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toBuffer();
  const path = `kennel/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage
    .from("photos")
    .upload(path, body, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
}

console.log("\nDatabase\n");

const stamp = new Date().toISOString().slice(0, 10);

const { data: dam, error: damError } = await supabase
  .from("dogs")
  .insert({
    slug: "dam",
    name: "Golden Pup's Dam",
    call_name: "Dam",
    sex: "bitch",
    colour: "Chocolate",
    dob: `${new Date().getFullYear() - 3}-01-01`,
    role: "dam",
    bio: "Mother to this litter, and the reason it is as steady as it is. Put her real name, date of birth and history in here from the admin panel.",
    hero_image: await upload(DAM.i, 1200),
    hero_alt: DAM.alt,
    is_published: true,
    sort_order: 1,
  })
  .select("id")
  .single();

if (damError) {
  console.error(`  dam failed: ${damError.message}`);
  process.exit(1);
}
console.log("  dam       created");

/* No sire. There is no photograph of an adult male in the folder, and a
   record with a borrowed photo would be worse than an honest gap — the cards
   simply show "—" until one is added. */

const born = new Date();
born.setDate(born.getDate() - 42);
const ready = new Date(born);
ready.setDate(ready.getDate() + 56);

const { data: litter, error: litterError } = await supabase
  .from("litters")
  .insert({
    code: `L-${stamp}`,
    dam_id: dam.id,
    born_on: born.toISOString().slice(0, 10),
    ready_on: ready.toISOString().slice(0, 10),
    status: "weaning",
    notes: `${PUPPIES.length} puppies, all chocolate. Correct the dates and this note in the admin panel.`,
    is_published: true,
  })
  .select("id")
  .single();

if (litterError) {
  console.error(`  litter failed: ${litterError.message}`);
  process.exit(1);
}
console.log(`  litter    L-${stamp}\n`);

for (const [n, p] of PUPPIES.entries()) {
  const heroUrl = await upload(p.i, 1100);
  const { error } = await supabase.from("puppies").insert({
    litter_id: litter.id,
    slug: p.name.toLowerCase(),
    name: p.name,
    sex: p.sex,
    colour: "Chocolate",
    collar_colour: p.collar,
    price_cents: p.price,
    status: "available",
    hero_image: heroUrl,
    hero_alt: p.alt,
    notes: p.note,
    is_published: true,
    sort_order: n + 1,
  });
  console.log(
    error
      ? `  ${p.name.padEnd(10)} FAILED: ${error.message}`
      : `  ${p.name.padEnd(10)} $${(p.price / 100).toFixed(0)}  ${p.collar}`,
  );
}

console.log("\nDone.");
