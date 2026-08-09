/**
 * Downloads every placeholder photograph declared in src/lib/images.ts into
 * public/placeholders/.
 *
 *   npm run placeholders          fetch anything missing
 *   npm run placeholders -- --force   re-fetch everything
 *
 * The client's real photographs replace these files one for one, keeping the
 * same filename. Nothing in the app has to change when they do.
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { images } from "../src/lib/images.ts";

const OUT = join(process.cwd(), "public", "placeholders");
const force = process.argv.includes("--force");

await mkdir(OUT, { recursive: true });

const exists = async (p) =>
  access(p).then(
    () => true,
    () => false,
  );

let fetched = 0;
let skipped = 0;
const failures = [];

for (const [key, slot] of Object.entries(images)) {
  const file = join(OUT, `${key}.jpg`);

  if (!force && (await exists(file))) {
    skipped += 1;
    continue;
  }

  try {
    const res = await fetch(slot.source, {
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    console.log(`fetched  ${key}.jpg`);
    fetched += 1;
  } catch (err) {
    console.error(`FAILED   ${key}.jpg — ${err.message}`);
    failures.push(key);
  }
}

console.log(`\n${fetched} fetched, ${skipped} already present.`);

if (failures.length) {
  console.error(`\n${failures.length} failed: ${failures.join(", ")}`);
  process.exit(1);
}
