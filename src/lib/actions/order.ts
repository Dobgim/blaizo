"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getPuppyBySlug } from "@/lib/queries";
import { orderSchema, orderReference, type OrderValues } from "@/lib/schemas/order";
import type { Web3FormsMessage } from "@/lib/web3forms";
import type { Invoice } from "@/lib/invoice";
import { paymentMethods, siteConfig } from "@/lib/site-config";
import { formatDate, formatPrice } from "@/lib/format";

/**
 * Place an order.
 *
 * Nothing is charged and no payment details are published. The buyer says what
 * they want and how they would like to pay; the kennel is emailed; the kennel
 * gets in touch with the details personally.
 *
 * That last part is a deliberate safety property, not an inconvenience.
 * Payment details printed on a page or sent by an automated email are details
 * an attacker can substitute — it is how transfer-based sales are intercepted.
 * Given by a person, on a call the buyer was told to expect, they cannot be.
 *
 * The price comes from the database, never the form. A price posted by the
 * browser is a price the browser can change.
 */

/** "Truffle", "Truffle and Daisy", "Truffle, Daisy and Mocha". */
function listNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export type OrderResult =
  | { ok: true; reference: string; message: Web3FormsMessage; invoice: Invoice }
  | { ok: false; error: string };

export async function placeOrder(values: OrderValues): Promise<OrderResult> {
  const parsed = orderSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: "Check the form and try again." };
  }
  const v = parsed.data;

  /* Every puppy is looked up fresh and checked, and one failure fails the whole
     order. Recording half of a two-puppy order would be worse than recording
     none of it: the buyer would be told it went through, and the kennel would
     be looking at a receipt that does not match the conversation. */
  const found = await Promise.all(v.puppySlugs.map((s) => getPuppyBySlug(s)));

  const missing = v.puppySlugs.filter((_, i) => !found[i]);
  if (missing.length > 0) {
    return {
      ok: false,
      error:
        "One of those puppies is no longer listed. Please go back to your cart and check it.",
    };
  }

  const puppies = found.filter((p): p is NonNullable<typeof p> => p !== null);

  const placed = puppies.filter((p) => p.status === "placed");
  if (placed.length > 0) {
    const names = listNames(placed.map((p) => p.name));
    return {
      ok: false,
      error: `${names} ${placed.length === 1 ? "has" : "have"} already gone home. Remove ${placed.length === 1 ? "that one" : "those"} from your cart, or call or text us and we will tell you what else is coming.`,
    };
  }

  /* Two lines for the same puppy would double the total and put the same dog on
     one invoice twice. The cart cannot normally produce it — the shortlist is
     keyed by id — but a hand-edited URL can. */
  const seen = new Set<string>();
  const unique = puppies.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  const totalCents = unique.reduce((sum, p) => sum + p.priceCents, 0);
  const reference = orderReference();
  const methodLabel =
    paymentMethods.find((m) => m.id === v.paymentMethod)?.label ??
    v.paymentMethod;

  // --- record it ------------------------------------------------------------

  const supabase = await createClient();
  if (supabase) {
    const single = unique.length === 1 ? unique[0] : null;

    /* The id is generated here rather than read back from the insert.
       `insert().select()` needs a SELECT policy for the inserting role, and
       anon deliberately has none — a buyer may write an order and must never
       be able to read one. Choosing the id up front means the line items can
       reference it without the header ever being selected. */
    const orderId = randomUUID();

    const { error } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        reference,
        buyer_name: v.buyerName,
        buyer_email: v.buyerEmail,
        buyer_phone: v.buyerPhone,
        buyer_location: v.buyerLocation,
        /* Only meaningful for a one-puppy order. `puppy_name` always gets
           something, because it is the row label in the admin list. */
        puppy_id: single?.id ?? null,
        puppy_slug: single?.slug ?? null,
        puppy_name: unique.map((p) => p.name).join(" + "),
        amount_cents: totalCents,
        payment_method: v.paymentMethod,
        notes: v.notes || null,
        paid_confirmed_at: null,
      });

    if (error) {
      console.error(`[order] insert failed: ${error.message}`);
      return {
        ok: false,
        error:
          "We could not record that order. Nothing has been charged — please call or text us and we will take it down by hand.",
      };
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      unique.map((p, i) => ({
        order_id: orderId,
        puppy_id: p.id,
        puppy_name: p.name,
        puppy_slug: p.slug,
        age_label: p.ageLabel || null,
        amount_cents: p.priceCents,
        sort_order: i,
      })),
    );

    /* The header saved and the lines did not. Deleting the header is the only
       way back to a clean state — a paid-looking order with no puppies on it is
       worse than no order, because the owner would have to guess what it was
       for. The buyer is told to call, and nothing has been charged. */
    if (itemsError) {
      console.error(`[order] items insert failed: ${itemsError.message}`);
      await supabase.from("orders").delete().eq("id", orderId);
      return {
        ok: false,
        error:
          "We could not record that order. Nothing has been charged — please call or text us and we will take it down by hand.",
      };
    }
  }

  /* --- the notification -------------------------------------------------------
     Built here, where the puppy and the price are known, but SENT by the
     browser. Web3Forms is behind Cloudflare, which challenges server-to-server
     POSTs and returns an HTML page instead of sending anything. */
  const summary = unique.map((p) => p.name).join(" + ");

  const message: Web3FormsMessage = {
    subject: `New order ${reference} — ${summary}`,
    fromName: `${siteConfig.shortName} website`,
    /* Reply in the inbox reaches the buyer, which is how the kennel sends the
       payment details. */
    replyTo: v.buyerEmail,
    fields: {
      Order: reference,
      /* One field per puppy, numbered, so a two-puppy order does not arrive as
         one run-together line the owner has to unpick over the phone. */
      ...Object.fromEntries(
        unique.map((p, i) => [
          unique.length === 1 ? "Puppy" : `Puppy ${i + 1}`,
          `${p.name} — ${p.priceCents > 0 ? formatPrice(p.priceCents) : "no price set"}${
            p.ageLabel ? `, ${p.ageLabel}` : ""
          } — ${siteConfig.url}/puppies/${p.slug}`,
        ]),
      ),
      Total: totalCents > 0 ? formatPrice(totalCents) : "No price set",
      "Full name": v.buyerName,
      Email: v.buyerEmail,
      Phone: v.buyerPhone,
      Address: v.buyerLocation,
      "Wants to pay by": methodLabel,
      Notes: v.notes || "—",
      "Next step":
        "Call them, then give the payment details yourself. Never email the details unprompted, and never change them by message.",
    },
  };

  /* --- the buyer's copy -------------------------------------------------------
     Built here so the invoice and the kennel's email are the same numbers from
     the same source. It is returned rather than rendered because the invoice
     page is reached by client navigation and the data never goes in the URL. */
  const invoice: Invoice = {
    reference,
    issuedAt: new Date().toISOString(),
    buyerName: v.buyerName,
    buyerEmail: v.buyerEmail,
    buyerPhone: v.buyerPhone,
    buyerLocation: v.buyerLocation,
    items: unique.map((p) => ({
      puppyName: p.name,
      puppySlug: p.slug,
      description: [
        p.sex === "dog" ? "Male" : "Female",
        p.colour,
        p.ageLabel || null,
      ]
        .filter(Boolean)
        .join(" · "),
      amountCents: p.priceCents,
    })),
    totalCents,
    paymentMethodLabel: methodLabel,
    notes: v.notes,
  };

  return { ok: true, reference, message, invoice };
}
