import { siteConfig, paymentMethods } from "@/lib/site-config";
import { formatPrice } from "@/lib/format";
import type { OrderValues } from "@/lib/schemas/order";

/**
 * The order receipt.
 *
 * A receipt for money that has not moved yet, which is an unusual thing and
 * has to be written carefully. Zelle, Cash App, Chime and Apple Cash are all
 * transfers the buyer makes by hand afterwards, so this email is really two
 * things at once: a record of what was ordered, and the instructions for
 * paying for it.
 *
 * It says "not yet paid" in plain words at the top. A document that looks like
 * proof of payment before any money has moved would cause exactly the dispute
 * it appears to prevent.
 */

export type ReceiptInput = OrderValues & {
  reference: string;
  puppyName: string;
  amountCents: number;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(title: string, body: string) {
  return `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#dfe0d8;font-family:Georgia,'Times New Roman',serif;color:#1e2a23;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#ecede6;border:1px solid #afb8b0;">
    <tr><td style="height:8px;background:#a9843f;"></td></tr>
    <tr><td style="padding:28px 28px 0;">
      <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6e6448;">
        ${escapeHtml(siteConfig.name)}
      </p>
      <h1 style="margin:14px 0 0;font-size:26px;line-height:1.15;font-weight:normal;">${escapeHtml(title)}</h1>
    </td></tr>
    <tr><td style="padding:20px 28px 28px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;">
      ${body}
    </td></tr>
    <tr><td style="padding:0 28px 28px;border-top:1px solid #afb8b0;">
      <p style="margin:16px 0 0;font-family:'Courier New',monospace;font-size:11px;line-height:1.7;color:#6e6448;">
        ${escapeHtml(siteConfig.contact.addressLine)}, ${escapeHtml(siteConfig.contact.locality)}, ${escapeHtml(siteConfig.contact.region)} ${escapeHtml(siteConfig.contact.postalCode)}<br>
        ${escapeHtml(siteConfig.contact.phone)} — call or text<br>
        ${escapeHtml(siteConfig.contact.email)}
      </p>
    </td></tr>
  </table>
</body></html>`;
}

function row(label: string, value: string, strong = false) {
  return `<tr>
    <th align="left" style="padding:8px 16px 8px 0;border-bottom:1px solid #dfe0d8;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6e6448;font-weight:normal;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</th>
    <td style="padding:8px 0;border-bottom:1px solid #dfe0d8;font-size:${strong ? "18px" : "15px"};${strong ? "font-weight:600;" : ""}">${escapeHtml(value)}</td>
  </tr>`;
}

function methodOf(id: string) {
  return paymentMethods.find((m) => m.id === id);
}

/** To the buyer: what they ordered, and how to pay for it. */
export function buyerReceiptHtml(order: ReceiptInput) {
  const method = methodOf(order.paymentMethod);

  return shell(
    `Order ${order.reference}`,
    `<p style="margin:0 0 18px;padding:12px 14px;background:#fff;border-left:3px solid #7a3b24;font-size:14px;">
       <strong>This is not a payment confirmation.</strong> It is a record of your
       order and the details for sending payment. Nothing has been charged, and
       ${escapeHtml(siteConfig.name)} has not received any money yet.
     </p>

     <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 22px;">
       ${row("Order", order.reference)}
       ${row("Puppy", order.puppyName)}
       ${row("Name", order.buyerName)}
       ${row("Email", order.buyerEmail)}
       ${row("Phone", order.buyerPhone)}
       ${row("Paying by", method?.label ?? order.paymentMethod)}
       ${row("Total due", formatPrice(order.amountCents), true)}
     </table>

     <p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6e6448;">
       How to pay
     </p>
     <p style="margin:0 0 6px;">Send <strong>${escapeHtml(formatPrice(order.amountCents))}</strong> to:</p>
     <p style="margin:0 0 6px;padding:12px 14px;background:#fff;border:1px solid #afb8b0;font-family:'Courier New',monospace;font-size:16px;">
       ${escapeHtml(method?.handle ?? "")}
     </p>
     <p style="margin:0 0 18px;font-size:14px;color:#524b36;">
       ${escapeHtml(method?.instruction ?? "")} Put <strong>${escapeHtml(order.reference)}</strong> in the note so we can match it to your order.
     </p>

     <p style="margin:0 0 14px;">
       The full amount is due — we do not take part payments or deposits. Once the
       transfer lands we will call you to arrange collection or delivery, and to
       go through the paperwork that travels with the puppy.
     </p>

     <p style="margin:0 0 14px;padding:12px 14px;background:#fff;border-left:3px solid #a9843f;font-size:14px;">
       <strong>Before you send anything:</strong> check the details above against
       what we have told you directly. If any message asks you to send money to a
       different name, tag or address than the one on this receipt, stop and call
       us on ${escapeHtml(siteConfig.contact.phone)}. We will never ask you to
       change payment details by email.
     </p>

     ${
       order.notes
         ? `<p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6e6448;">Your note</p>
            <p style="margin:0 0 14px;">${escapeHtml(order.notes)}</p>`
         : ""
     }

     <p style="margin:22px 0 0;font-size:14px;color:#524b36;">
       Questions before you pay? Call or text ${escapeHtml(siteConfig.contact.phone)},
       or message us on WhatsApp.
     </p>`,
  );
}

/** To the kennel: everything, and nothing to act on until money lands. */
export function ownerOrderHtml(order: ReceiptInput) {
  const method = methodOf(order.paymentMethod);

  return shell(
    `New order — ${order.puppyName}`,
    `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
       ${row("Order", order.reference)}
       ${row("Puppy", order.puppyName)}
       ${row("Amount", formatPrice(order.amountCents), true)}
       ${row("Method", method?.label ?? order.paymentMethod)}
       ${row("Name", order.buyerName)}
       ${row("Email", order.buyerEmail)}
       ${row("Phone", order.buyerPhone)}
     </table>

     ${order.notes ? `<p style="margin:0 0 16px;"><strong>Their note:</strong> ${escapeHtml(order.notes)}</p>` : ""}

     <p style="margin:0 0 16px;padding:12px 14px;background:#fff;border-left:3px solid #7a3b24;font-size:14px;">
       No money has been received. Mark the order paid in the admin panel only
       once you have seen the transfer arrive in the account itself — the
       website cannot know, and a notification in a payment app can be faked.
     </p>

     <p style="margin:0;">
       <a href="${siteConfig.url}/admin/orders" style="color:#7a3b24;">Open the orders list</a>
       &nbsp;·&nbsp;
       <a href="tel:${escapeHtml(order.buyerPhone.replace(/[^0-9+]/g, ""))}" style="color:#7a3b24;">Call them</a>
     </p>`,
  );
}
