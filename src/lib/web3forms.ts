/**
 * Email delivery through Web3Forms.
 *
 * Web3Forms takes a POST and emails it to the address that owns the access
 * key, which is all this site needs: the kennel is the only recipient. There
 * is no mail domain to verify and no sending reputation to look after, which
 * is why it suits a small business better than a transactional provider here.
 *
 * Called from Server Actions, never the browser. The access key is not a
 * secret in the strict sense — Web3Forms keys are designed to sit in public
 * HTML — but keeping it server-side means the endpoint cannot be scraped off
 * the page and used to spam the kennel's inbox.
 */

const ENDPOINT = "https://api.web3forms.com/submit";

export const isWeb3FormsConfigured = Boolean(
  process.env.WEB3FORMS_ACCESS_KEY,
);

export type Web3FormsResult = { ok: boolean; error?: string };

export async function sendViaWeb3Forms(args: {
  subject: string;
  /** Shown as the sender name in the kennel's inbox. */
  fromName: string;
  /** Hitting reply in the inbox should reach the customer. */
  replyTo?: string;
  /** Ordered label/value pairs. Web3Forms renders them as a table. */
  fields: Record<string, string>;
}): Promise<Web3FormsResult> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.warn("[web3forms] no access key set; nothing sent.");
    return { ok: false, error: "not configured" };
  }

  try {
    /* Ten seconds, then give up. The caller has already saved the order, and
       a checkout that hangs because a mail API is slow is worse than one that
       completes and reports the email did not go. */
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        /* Web3Forms sits behind Cloudflare, which challenges requests with no
           user agent — Node sends none by default and the POST comes back as
           an HTML "Just a moment…" page rather than JSON. Naming the caller
           also means the kennel can identify this traffic later. */
        "User-Agent": "GoldenPupKennel-Site/1.0 (+https://goldenpupkennel.vercel.app)",
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: args.subject,
        from_name: args.fromName,
        replyto: args.replyTo,
        ...args.fields,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    /* Read as text first. A Cloudflare challenge returns HTML with a 403, and
       calling .json() on it throws a parse error that hides the real cause. */
    const raw = await response.text();

    if (raw.trimStart().startsWith("<")) {
      console.error(
        `[web3forms] ${args.subject}: blocked before reaching Web3Forms ` +
          `(HTTP ${response.status}, HTML response). This is Cloudflare ` +
          `challenging the request, not a bad access key.`,
      );
      return { ok: false, error: "blocked by Cloudflare" };
    }

    const result = JSON.parse(raw) as { success?: boolean; message?: string };

    if (!response.ok || !result.success) {
      const message = result.message ?? `HTTP ${response.status}`;
      console.error(`[web3forms] ${args.subject}: ${message}`);
      return { ok: false, error: message };
    }

    return { ok: true };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "unknown error";
    console.error(`[web3forms] ${args.subject} threw: ${message}`);
    return { ok: false, error: message };
  }
}
