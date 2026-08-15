"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { getPuppyBySlug } from "@/lib/queries";
import { orderSchema, orderReference, type OrderValues } from "@/lib/schemas/order";
import { buyerReceiptHtml, ownerOrderHtml } from "@/lib/email-receipt";
import { siteConfig } from "@/lib/site-config";

/**
 * Place an order.
 *
 * No money moves here and none can: every method offered is a manual transfer
 * the buyer makes from their own app afterwards. This records what was ordered
 * and emails the receipt that tells them where to send it.
 *
 * The price comes from the database, never from the form. A price posted by
 * the browser is a price the browser can change.
 */

const apiKey = process.env.RESEND_API_KEY ?? "";
const from = process.env.RESEND_FROM ?? "";
const ownerTo = process.env.OWNER_NOTIFICATION_EMAIL ?? "";

export type OrderResult =
  | { ok: true; reference: string; amountCents: number; emailed: boolean }
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
      error: `${puppy.name} has already gone home. Call us and we will tell you what else is coming.`,
    };
  }
  if (puppy.priceCents <= 0) {
    return {
      ok: false,
      error: `${puppy.name} does not have a price set yet. Please call us instead.`,
    };
  }

  const reference = orderReference();
  const receipt = {
    ...v,
    reference,
    puppyName: puppy.name,
    amountCents: puppy.priceCents,
  };

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
      /* The order is the record. Losing it while telling the buyer to send
         money would leave payments arriving against nothing. */
      console.error(`[order] insert failed: ${error.message}`);
      return {
        ok: false,
        error:
          "We could not record that order. Nothing has been charged — please call or text us and we will take it down by hand.",
      };
    }
  }

  const emailed = await sendReceipts(receipt);
  return { ok: true, reference, amountCents: puppy.priceCents, emailed };
}

async function sendReceipts(receipt: Parameters<typeof buyerReceiptHtml>[0]) {
  if (!apiKey || !from) {
    console.warn("[order] Resend not configured; no receipt sent.");
    return false;
  }

  try {
    const resend = new Resend(apiKey);

    const results = await Promise.allSettled([
      resend.emails.send({
        from,
        to: receipt.buyerEmail,
        subject: `Your order ${receipt.reference} — ${receipt.puppyName}`,
        html: buyerReceiptHtml(receipt),
        replyTo: siteConfig.contact.email,
      }),
      ownerTo
        ? resend.emails.send({
            from,
            to: ownerTo,
            subject: `Order ${receipt.reference} — ${receipt.puppyName}`,
            html: ownerOrderHtml(receipt),
            replyTo: receipt.buyerEmail,
          })
        : Promise.resolve(null),
    ]);

    const buyerSent =
      results[0].status === "fulfilled" && !results[0].value?.error;
    if (!buyerSent) console.error("[order] buyer receipt failed to send.");
    return buyerSent;
  } catch (cause) {
    console.error("[order] sending receipts threw:", cause);
    return false;
  }
}
