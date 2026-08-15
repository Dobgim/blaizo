/**
 * Email delivery through Web3Forms.
 *
 * Sent FROM THE BROWSER, deliberately. Web3Forms sits behind Cloudflare, which
 * challenges server-to-server POSTs — from a Node process the reply is an HTML
 * "Just a moment…" page rather than JSON, and no mail is ever sent. Their whole
 * product is designed around a form in a page posting directly, and that is the
 * path that reliably gets through.
 *
 * The access key is therefore public, which is how Web3Forms intends it: their
 * documentation puts it in plain HTML. It authorises delivery to one fixed
 * inbox and nothing else — it cannot read anything, and it cannot be pointed
 * somewhere new. The cost is that a determined person could use it to send the
 * kennel junk; Web3Forms' own spam filtering is the answer to that, and the key
 * can be rotated in one place if it ever becomes a nuisance.
 */

const ENDPOINT = "https://api.web3forms.com/submit";

export const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";
export const isWeb3FormsConfigured = ACCESS_KEY.length > 0;

export type Web3FormsMessage = {
  subject: string;
  /** Shown as the sender name in the kennel's inbox. */
  fromName: string;
  /** Hitting reply in the inbox should reach the customer. */
  replyTo?: string;
  /** Ordered label/value pairs. Web3Forms renders them as a table. */
  fields: Record<string, string>;
};

/**
 * Send by submitting a real form into a hidden iframe.
 *
 * Three constraints forced this shape, in order:
 *
 *   1. A cross-origin fetch cannot work. The endpoint sits behind Cloudflare,
 *      which answers without `Access-Control-Allow-Origin` whenever it
 *      intervenes; the browser then discards the response and no mail is sent.
 *      A form post is not subject to CORS at all.
 *   2. Submitting the form as a top-level navigation does work, but stakes the
 *      buyer's confirmation on a third party being reachable — if it is not,
 *      they land on a browser error page having just placed an order, with no
 *      reference number and no idea whether it went through.
 *   3. So the form targets a hidden iframe. The post leaves the browser
 *      exactly as before, the page never moves, and the caller navigates to
 *      its own confirmation immediately afterwards.
 *
 * The trade-off is that the result cannot be read: the iframe is cross-origin.
 * That is acceptable here — the order is already recorded server-side before
 * this is called, so the email is a notification, not the record.
 */
export function postToWeb3Forms(message: Web3FormsMessage): void {
  if (!ACCESS_KEY) {
    console.warn("[web3forms] no access key set; nothing sent.");
    return;
  }

  const frameName = `w3f-${Date.now()}`;
  const frame = document.createElement("iframe");
  frame.name = frameName;
  frame.style.display = "none";
  document.body.appendChild(frame);

  const form = document.createElement("form");
  form.method = "POST";
  form.action = ENDPOINT;
  form.target = frameName;
  form.style.display = "none";

  const add = (name: string, value: string) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  add("access_key", ACCESS_KEY);
  add("subject", message.subject);
  add("from_name", message.fromName);
  if (message.replyTo) add("replyto", message.replyTo);
  /* Web3Forms' own honeypot. A bot filling every field trips it; a person
     never sees it. */
  add("botcheck", "");

  for (const [label, value] of Object.entries(message.fields)) {
    add(label, value);
  }

  document.body.appendChild(form);
  form.submit();
}
