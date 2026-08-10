import { siteConfig } from "@/lib/site-config";
import { formatDate } from "@/lib/format";
import type { Puppy } from "@/lib/types";

/**
 * WhatsApp hand-off.
 *
 * Nothing is charged on this site. Every enquiry — a question about one
 * puppy, or a full application — ends by opening WhatsApp with the message
 * already written, so the visitor sends it in one tap and the breeder
 * receives something they can act on rather than "hi, is this available".
 *
 * wa.me has a practical URL ceiling, so long messages are trimmed rather
 * than silently truncated by the browser.
 */

const MAX_MESSAGE_CHARS = 1400;

/** Builds a wa.me link. Works on desktop web and both mobile apps. */
export function whatsappUrl(message: string): string {
  const trimmed =
    message.length > MAX_MESSAGE_CHARS
      ? `${message.slice(0, MAX_MESSAGE_CHARS - 60).trimEnd()}\n\n(continued in the next message)`
      : message;

  return `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent(trimmed)}`;
}

/** A line of the message, skipped entirely when the value is empty. */
function line(label: string, value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  return `${label}: ${value}`;
}

function compose(heading: string, lines: (string | null)[]) {
  return [heading, "", ...lines.filter(Boolean)].join("\n");
}

/** "I'm interested in this puppy" — from a puppy card or detail page. */
export function puppyEnquiryMessage(puppy: Puppy): string {
  return compose(`Hello — I'd like to ask about ${puppy.name}.`, [
    line("Puppy", puppy.name),
    line("Litter", puppy.litterId),
    line("Sex", puppy.sex === "dog" ? "Male" : "Female"),
    line("Colour", puppy.colour),
    line("Collar", puppy.collarColour),
    line("Sire", puppy.sireName),
    line("Dam", puppy.damName),
    line("Ready", formatDate(puppy.readyOn)),
    "",
    `Listing: ${siteConfig.url}/puppies/${puppy.slug}`,
  ]);
}

/** A general enquiry with no particular puppy attached. */
export function generalEnquiryMessage(): string {
  return compose(
    `Hello — I'd like to ask about ${siteConfig.breed} puppies at ${siteConfig.name}.`,
    [],
  );
}

/** Everything the application form collected, as one readable message. */
export type ApplicationMessageInput = {
  name: string;
  email: string;
  phone: string;
  puppyName?: string | null;
  litterId?: string | null;
  homeType: string;
  hasYard: boolean;
  yardFenced?: boolean | null;
  otherPets: string;
  childrenAges: string;
  experience: string;
  timeAlone: string;
  preferredTiming: string;
  message: string;
};

export function applicationMessage(input: ApplicationMessageInput): string {
  return compose(
    `Hello — I've completed a puppy application for ${siteConfig.name}.`,
    [
      line("Name", input.name),
      line("Email", input.email),
      line("Phone", input.phone),
      "",
      line("Puppy of interest", input.puppyName ?? "No particular puppy yet"),
      line("Litter", input.litterId),
      "",
      line("Home", input.homeType),
      line(
        "Yard",
        input.hasYard
          ? input.yardFenced
            ? "Yes, fenced"
            : "Yes, not fenced"
          : "No yard",
      ),
      line("Other pets", input.otherPets || "None"),
      line("Children at home", input.childrenAges || "None"),
      line("Experience with the breed", input.experience),
      line("Hours alone on a typical day", input.timeAlone),
      line("Timing", input.preferredTiming),
      "",
      input.message ? `Anything else:\n${input.message}` : null,
    ],
  );
}
