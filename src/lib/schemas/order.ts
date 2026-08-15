import { z } from "zod";

/**
 * The order form.
 *
 * Five fields and a payment choice. Anything more is friction on the one page
 * where friction costs the kennel a sale — the vetting conversation happens
 * afterwards, by phone, as it always did.
 */
export const orderSchema = z.object({
  buyerName: z
    .string()
    .trim()
    .min(2, "Enter your full name, as it appears on your bank account."),
  buyerEmail: z
    .string()
    .trim()
    .min(1, "Enter an email address — your receipt goes there.")
    .email("That email address does not look right. Check for a typo."),
  buyerPhone: z
    .string()
    .trim()
    .min(7, "Enter a phone number we can reach you on, including the area code."),
  /* Free text on purpose. This is the billing address on the invoice and the
     rough answer to "how far is this puppy travelling" — both of which a
     person types better than a set of boxes forces them to. */
  buyerLocation: z
    .string()
    .trim()
    .min(4, "Enter your address, so we can put it on your invoice.")
    .max(300, "That is longer than we need — town, state and postcode is plenty."),
  paymentMethod: z.enum(["zelle", "cashapp", "chime", "applepay"], {
    message: "Choose how you would like to pay.",
  }),
  puppySlug: z.string().trim().min(1),
  notes: z.string().trim().max(1000),
});

export type OrderValues = z.infer<typeof orderSchema>;

/**
 * A short, unambiguous order reference.
 *
 * No 0/O or 1/I — this gets read down a phone and typed into a Cash App note,
 * and a misread character means money arriving against no order.
 */
export function orderReference(): string {
  const alphabet = "ACDEFGHJKLMNPQRTUVWXY2345679";
  let body = "";
  for (let i = 0; i < 6; i += 1) {
    body += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `GP-${body}`;
}
