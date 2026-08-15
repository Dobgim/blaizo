"use server";

import { createClient } from "@/lib/supabase/server";
import { getPuppyBySlug } from "@/lib/queries";
import { orderSchema, orderReference, type OrderValues } from "@/lib/schemas/order";
import type { Web3FormsMessage } from "@/lib/web3forms";
import { paymentMethods, siteConfig } from "@/lib/site-config";
import { formatPrice } from "@/lib/format";

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

export type OrderResult =
  | { ok: true; reference: string; message: Web3FormsMessage }
  | { ok: false; error: string };

export async function placeOrder(values: OrderValues): Promise<OrderResult> {
  const parsed = orderSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: "Check the form and try again." };
  }
  const v = parsed.data;

  const puppy = await getPuppyBySlug(v.puppySlug);
  if (!puppy) {
    return {
      ok: false,
      error: "That puppy is no longer listed. Please go back and choose again.",
    };
  }
  if (puppy.status === "placed") {
    return {
      ok: false,
      error: `${puppy.name} has already gone home. Call or text us and we will tell you what else is coming.`,
    };
  }

  const reference = orderReference();
  const methodLabel =
    paymentMethods.find((m) => m.id === v.paymentMethod)?.label ??
    v.paymentMethod;

  // --- record it ------------------------------------------------------------

  const supabase = await createClient();
  if (supabase) {
    const { error } = await supabase.from("orders").insert({
      reference,
      buyer_name: v.buyerName,
      buyer_email: v.buyerEmail,
      buyer_phone: v.buyerPhone,
      puppy_id: puppy.id,
      puppy_name: puppy.name,
      puppy_slug: puppy.slug,
      amount_cents: puppy.priceCents,
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
  }

  /* --- the notification -------------------------------------------------------
     Built here, where the puppy and the price are known, but SENT by the
     browser. Web3Forms is behind Cloudflare, which challenges server-to-server
     POSTs and returns an HTML page instead of sending anything. */
  const message: Web3FormsMessage = {
    subject: `New order ${reference} — ${puppy.name}`,
    fromName: `${siteConfig.shortName} website`,
    /* Reply in the inbox reaches the buyer, which is how the kennel sends the
       payment details. */
    replyTo: v.buyerEmail,
    fields: {
      Order: reference,
      Puppy: puppy.name,
      Price:
        puppy.priceCents > 0 ? formatPrice(puppy.priceCents) : "No price set",
      "Full name": v.buyerName,
      Email: v.buyerEmail,
      Phone: v.buyerPhone,
      "Wants to pay by": methodLabel,
      Notes: v.notes || "—",
      "Puppy page": `${siteConfig.url}/puppies/${puppy.slug}`,
      "Next step":
        "Call them, then give the payment details yourself. Never email the details unprompted, and never change them by message.",
    },
  };

  return { ok: true, reference, message };
}
