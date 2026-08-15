/**
 * Email delivery through Web3Forms.
 *
 * Sent FROM THE BROWSER, deliberately, which is the only path Web3Forms
 * documents. A POST from a Node process is challenged before it arrives and
 * comes back as an HTML page rather than JSON, so no mail is ever sent. Their
 * product is built around a page posting directly, and that is what we do.
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

export type SendOutcome =
  | { sent: true }
  /** The request left, but we could not read the answer. Unknown, not failed. */
  | { sent: "unconfirmed"; reason: string }
  | { sent: false; reason: string };

/**
 * Send the notification, preferring the path that can tell us whether it worked.
 *
 * Web3Forms' documented browser call is a plain `fetch` with a JSON body, and
 * the endpoint sends CORS headers so the reply can be read. That is what we try
 * first, because it returns `{ success: true }` — a real answer we can log and
 * act on.
 *
 * If that throws, the request never got out: an extension, an ad blocker, a
 * captive network. A form post is then worth trying, because it is not subject
 * to CORS and is not cancelled by the same filters. It targets a hidden iframe
 * so the page never moves, at the cost of the answer being unreadable — hence
 * "unconfirmed" rather than "sent".
 *
 * Either way the order is already recorded server-side before this runs, so
 * this email is a notification, not the record.
 */
export async function postToWeb3Forms(
  message: Web3FormsMessage,
): Promise<SendOutcome> {
  if (!ACCESS_KEY) {
    console.warn("[web3forms] no access key set; nothing sent.");
    return { sent: false, reason: "No access key configured." };
  }

  const payload: Record<string, string> = {
    access_key: ACCESS_KEY,
    subject: message.subject,
    from_name: message.fromName,
    ...(message.replyTo ? { replyto: message.replyTo } : {}),
    ...message.fields,
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as {
      success?: boolean;
      message?: string;
    };

    if (result.success) return { sent: true };

    /* A read answer that says no is final — retrying by form post would only
       resend something Web3Forms has already refused. */
    const reason = result.message ?? `Web3Forms refused it (${response.status}).`;
    console.error(`[web3forms] ${reason}`);
    return { sent: false, reason };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[web3forms] fetch failed (${reason}); trying a form post.`);
    return postByHiddenForm(payload)
      ? { sent: "unconfirmed", reason }
      : { sent: false, reason };
  }
}

/**
 * Fallback: submit a real form into a hidden iframe.
 *
 * Not subject to CORS, and survives filters that cancel background fetches.
 * The iframe is cross-origin, so the result cannot be read — the caller treats
 * this as "we tried", never as "it arrived".
 */
function postByHiddenForm(payload: Record<string, string>): boolean {
  if (typeof document === "undefined") return false;

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

  /* Web3Forms' own honeypot. A bot filling every field trips it; a person
     never sees it. */
  add("botcheck", "");

  for (const [name, value] of Object.entries(payload)) {
    add(name, value);
  }

  document.body.appendChild(form);
  form.submit();
  return true;
}
