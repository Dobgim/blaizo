/**
 * The invoice a buyer is shown the moment their order goes through.
 *
 * Handed from the checkout to the invoice page through sessionStorage rather
 * than the URL or a second database read, for one reason: it contains the
 * buyer's name, address, email and phone. A query string puts all of that in
 * browser history, in the referrer of anything the page loads, and in any
 * analytics that records paths. Reading it back from the database instead
 * would mean a public policy on `orders` letting anyone who guesses a
 * reference read a stranger's address.
 *
 * sessionStorage has neither problem: the data never leaves the tab it was
 * created in, and it goes when the tab does. The cost is that the invoice
 * cannot be reopened later from a link — which is why it invites printing,
 * and why the kennel's own copy arrives by email independently.
 */

export type Invoice = {
  reference: string;
  /** ISO 8601. Rendered in the reader's locale on the client. */
  issuedAt: string;

  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerLocation: string;

  puppyName: string;
  puppySlug: string;
  /** "Female · Chocolate · Ready 14 March" — the line item's description. */
  puppyDescription: string;
  amountCents: number;

  paymentMethodLabel: string;
  notes: string;
};

const KEY_PREFIX = "goldenpup:invoice:";

/** Where the invoice page for a given reference lives. */
export function invoicePath(reference: string): string {
  return `/checkout/invoice?ref=${encodeURIComponent(reference)}`;
}

export function stashInvoice(invoice: Invoice): void {
  try {
    window.sessionStorage.setItem(
      `${KEY_PREFIX}${invoice.reference}`,
      JSON.stringify(invoice),
    );
  } catch {
    /* Private browsing, or storage full. The invoice page falls back to
       telling the buyer their order is safe and to check their email — the
       order itself was recorded server-side and is not at risk. */
  }
}

export function readInvoice(reference: string): Invoice | null {
  try {
    const raw = window.sessionStorage.getItem(`${KEY_PREFIX}${reference}`);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    /* One field is enough to tell a real invoice from something else that
       happens to be sitting under this key. */
    return "reference" in parsed ? (parsed as Invoice) : null;
  } catch {
    return null;
  }
}
