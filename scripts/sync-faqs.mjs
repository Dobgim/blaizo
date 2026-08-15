/**
 * Push src/lib/content/faqs.ts to the database.
 *
 *   npm run sync:faqs
 *
 * The site reads FAQs from Supabase and only falls back to the file when no
 * project is configured, so editing the file alone changes nothing on a live
 * site. This makes the file the source of truth and the database a copy of it.
 *
 * It replaces the whole set rather than merging. FAQs are a small, hand-written
 * body of text that is rewritten as a whole when the business changes; matching
 * rows up by question text would silently strand the old wording of anything
 * that had been rephrased.
 *
 * Anything the owner has since written directly in the admin panel WILL be
 * removed, so it prints what it is about to delete and stops for confirmation
 * unless --yes is passed.
 */
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { pathToFileURL } from "node:url";
import { register } from "node:module";

// Read the TypeScript source without a build step.
const source = await readFile("src/lib/content/faqs.ts", "utf8");
const body = source.slice(source.indexOf("export const fallbackFaqs"));
const literal = body.slice(body.indexOf("["), body.lastIndexOf("];") + 1);
const groups = eval(literal);

const env = Object.fromEntries(
  (await readFile(".env.local", "utf8"))
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

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
  console.error(`Could not sign in: ${authError.message}`);
  process.exit(1);
}

const { data: isAdmin } = await supabase
  .from("admins")
  .select("user_id")
  .eq("user_id", session.user.id)
  .maybeSingle();
if (!isAdmin) {
  console.error("Signed in, but this account is not in `admins`.");
  process.exit(1);
}

const { data: existing } = await supabase.from("faqs").select("id, question");
const count = existing?.length ?? 0;
const incoming = groups.flatMap((g) => g.items);

console.log(`Replacing ${count} FAQ(s) with ${incoming.length}.\n`);
for (const g of groups) {
  console.log(`  ${g.category} — ${g.items.length}`);
}

if (!process.argv.includes("--yes") && count > 0) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("\nDelete the existing set and replace it? (yes/no) ");
  rl.close();
  if (answer.trim().toLowerCase() !== "yes") {
    console.log("Left alone.");
    process.exit(0);
  }
}

if (count > 0) {
  const { error } = await supabase
    .from("faqs")
    .delete()
    .in("id", existing.map((r) => r.id));
  if (error) {
    console.error(`Could not clear the old set: ${error.message}`);
    process.exit(1);
  }
}

const rows = groups.flatMap((group, gi) =>
  group.items.map((item, ii) => ({
    category: group.category,
    question: item.question,
    answer: item.answer,
    /* Sort order carries the group's position too, so the categories come out
       in the order they are written in the file rather than alphabetically. */
    sort_order: gi * 100 + ii,
    is_published: true,
  })),
);

const { error: insertError } = await supabase.from("faqs").insert(rows);
if (insertError) {
  console.error(`Insert failed: ${insertError.message}`);
  process.exit(1);
}

console.log(`\n${rows.length} FAQs live.`);
