/**
 * Send one real test email through Web3Forms.
 *
 *   npm run test:email
 *
 * Run this from the machine that will be sending — your own, and again from a
 * deployed environment if you can — because the answer differs by network.
 * Web3Forms sits behind Cloudflare, which challenges requests it does not like
 * the look of, and a challenged request comes back as an HTML page rather than
 * JSON. That failure looks nothing like a bad access key, so this script tells
 * the two apart explicitly.
 */
import { readFile } from "node:fs/promises";

const env = Object.fromEntries(
  (await readFile(".env.local", "utf8"))
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const key = env.WEB3FORMS_ACCESS_KEY;
if (!key) {
  console.error("No WEB3FORMS_ACCESS_KEY in .env.local.");
  process.exit(1);
}

console.log(`Sending a test with key ${key.slice(0, 8)}…\n`);

const response = await fetch("https://api.web3forms.com/submit", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "GoldenPupKennel-Site/1.0 (+https://goldenpupkennel.vercel.app)",
  },
  body: JSON.stringify({
    access_key: key,
    subject: "Golden Pup — test email from the website",
    from_name: "Golden Pup website",
    Test: "If you are reading this, order and application emails will arrive.",
    Sent: new Date().toISOString(),
    "You can": "delete this message.",
  }),
});

const raw = await response.text();

if (raw.trimStart().startsWith("<")) {
  console.error(
    `BLOCKED (HTTP ${response.status}).\n\n` +
      "Cloudflare challenged the request before it reached Web3Forms. The\n" +
      "access key is probably fine — this network is the problem. Try again\n" +
      "from a different connection, or check whether it works from the\n" +
      "deployed site, which sends from Vercel rather than from here.",
  );
  process.exit(1);
}

let result;
try {
  result = JSON.parse(raw);
} catch {
  console.error(`Unexpected reply (HTTP ${response.status}):\n${raw.slice(0, 300)}`);
  process.exit(1);
}

if (result.success) {
  console.log("Sent. Check the inbox the access key belongs to.");
} else {
  console.error(`Web3Forms refused it: ${result.message ?? "no message"}`);
  console.error("That usually means the access key is wrong or not activated.");
  process.exit(1);
}
