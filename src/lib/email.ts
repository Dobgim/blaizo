import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";
import type { ApplicationValues } from "@/lib/schemas/application";

/**
 * Transactional email.
 *
 * Two messages per application: one to the kennel so there is a record outside
 * WhatsApp, and one to the applicant so they have something to keep with our
 * name on it. Neither is a receipt — nothing has been paid — and the
 * applicant's copy says so explicitly, because a "confirmation" email that
 * looks like an invoice is exactly what a scam looks like.
 *
 * Email never blocks the WhatsApp hand-off. If Resend is unconfigured or
 * down, sending is skipped and the visitor's conversation still happens.
 */

const apiKey = process.env.RESEND_API_KEY ?? "";
const from = process.env.RESEND_FROM ?? "";
const ownerTo = process.env.OWNER_NOTIFICATION_EMAIL ?? "";

export const isEmailConfigured = apiKey !== "" && from !== "";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Shared shell. Inline styles only — email clients ignore stylesheets. */
function wrap(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#dfe0d8;font-family:Georgia,'Times New Roman',serif;color:#1e2a23;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ecede6;border:1px solid #afb8b0;">
    <tr><td style="padding:28px 28px 0;">
      <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#6e6448;">
        ${escapeHtml(siteConfig.name)}
      </p>
      <h1 style="margin:14px 0 0;font-size:24px;line-height:1.15;font-weight:normal;">${escapeHtml(title)}</h1>
    </td></tr>
    <tr><td style="padding:20px 28px 28px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1e2a23;">
      ${bodyHtml}
    </td></tr>
    <tr><td style="padding:0 28px 28px;border-top:1px solid #afb8b0;">
      <p style="margin:16px 0 0;font-family:'Courier New',monospace;font-size:11px;line-height:1.7;color:#6e6448;">
        ${escapeHtml(siteConfig.contact.addressLine)}<br>
        ${escapeHtml(`${siteConfig.contact.locality}, ${siteConfig.contact.region} ${siteConfig.contact.postalCode}`)}<br>
        ${escapeHtml(siteConfig.contact.phone)}
      </p>
    </td></tr>
  </table>
</body></html>`;
}

function row(label: string, value: string) {
  if (!value) return "";
  return `<tr>
    <th align="left" style="padding:6px 16px 6px 0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6e6448;font-weight:normal;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</th>
    <td style="padding:6px 0;font-size:14px;">${escapeHtml(value)}</td>
  </tr>`;
}

async function send(args: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!isEmailConfigured || !args.to) return { ok: false as const };

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      replyTo: args.replyTo,
    });
    if (error) {
      console.error(`[email] ${args.subject}: ${error.message}`);
      return { ok: false as const };
    }
    return { ok: true as const };
  } catch (cause) {
    console.error(`[email] ${args.subject} threw:`, cause);
    return { ok: false as const };
  }
}

/** To the kennel. Everything, so it can be acted on from the email alone. */
export async function sendOwnerNotification(v: ApplicationValues) {
  const yard = v.hasYard
    ? v.yardFenced
      ? "Yes, fenced"
      : "Yes, not fenced"
    : "No yard";

  const html = wrap(
    `New application from ${v.name}`,
    `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${row("Name", v.name)}
      ${row("Email", v.email)}
      ${row("Phone", v.phone)}
      ${row("Puppy", v.puppyName || "No particular puppy")}
      ${row("Home", v.homeType)}
      ${row("Yard", yard)}
      ${row("Other pets", v.otherPets || "None")}
      ${row("Children", v.childrenAges || "None")}
      ${row("Hours alone", v.timeAlone)}
      ${row("Timing", v.preferredTiming)}
    </table>
    <p style="margin:20px 0 6px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6e6448;">Experience</p>
    <p style="margin:0;">${escapeHtml(v.experience)}</p>
    ${
      v.message
        ? `<p style="margin:20px 0 6px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6e6448;">Anything else</p>
           <p style="margin:0;">${escapeHtml(v.message)}</p>`
        : ""
    }
    <p style="margin:24px 0 0;">
      <a href="https://wa.me/${v.phone.replace(/\D/g, "")}" style="color:#7a3b24;">Reply on WhatsApp</a>
      &nbsp;·&nbsp;
      <a href="${siteConfig.url}/admin/applications" style="color:#7a3b24;">Open the inbox</a>
    </p>`,
  );

  return send({
    to: ownerTo,
    subject: `Application — ${v.name}`,
    html,
    // Replying to the notification replies to the applicant.
    replyTo: v.email,
  });
}

/** To the applicant. A record of what they sent, and no false urgency. */
export async function sendApplicantConfirmation(v: ApplicationValues) {
  const html = wrap(
    "We have your application",
    `<p style="margin:0 0 14px;">Thank you — this is your copy, so you know what reached us.</p>
     <p style="margin:0 0 14px;"><strong>Nothing has been charged and nothing is owed.</strong> We take no payment through our website at all. If anyone contacts you using our name and asks for money by gift card, wire transfer or cryptocurrency, it is not us — please call ${escapeHtml(siteConfig.contact.phone)} and tell us.</p>
     <p style="margin:0 0 14px;">We read every application and we reply to every application, usually within two days. We will always talk to you on the phone before anything is agreed, including when the answer is no. If we do not think we are the right kennel for what you are after, we will tell you and give you two other names.</p>
     <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6e6448;">What you sent us</p>
     <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
       ${row("Name", v.name)}
       ${row("Phone", v.phone)}
       ${row("Puppy", v.puppyName || "No particular puppy")}
       ${row("Timing", v.preferredTiming)}
     </table>
     <p style="margin:22px 0 0;">In the meantime, the page worth reading twice is <a href="${siteConfig.url}/process/health-testing" style="color:#7a3b24;">how we health test</a> — including what we do when one of our dogs does not pass.</p>`,
  );

  return send({
    to: v.email,
    subject: `Your application to ${siteConfig.name}`,
    html,
  });
}
