import { z } from "zod";

/**
 * The application schema.
 *
 * Error messages say what to fix, not that something is wrong. "Enter a phone
 * number we can reach you on" is actionable; "Invalid input" is not.
 *
 * The questions are the ones a breeder actually needs answered. Nothing here
 * exists to qualify a lead — if a field would not change whether we place a
 * puppy with this person, it is not on the form.
 */

export const applicationSchema = z.object({
  // --- Step 1: who you are ---
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name so we know who we are talking to."),
  email: z
    .string()
    .trim()
    .min(1, "Enter an email address — it is how we send the paperwork.")
    .email("That email address does not look right. Check for a typo."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a phone number we can reach you on, including the area code."),

  // --- Step 2: your home ---
  homeType: z
    .string()
    .trim()
    .min(1, "Tell us what kind of home the dog would be coming to."),
  hasYard: z.boolean(),
  yardFenced: z.boolean(),
  /* Optional fields are plain strings rather than `.optional().default("")`.
     That combination gives zod a different input and output type, which
     react-hook-form cannot reconcile — and an empty string is the honest
     representation of "left blank" for a text input anyway. */
  otherPets: z.string().trim().max(500),
  childrenAges: z.string().trim().max(300),
  timeAlone: z
    .string()
    .trim()
    .min(1, "Give us a rough number of hours — an honest answer helps you, not us."),

  // --- Step 3: the dog ---
  experience: z
    .string()
    .trim()
    .min(
      20,
      "A couple of sentences, please. First-time owners are welcome — we just need to know which you are.",
    )
    .max(1500),
  puppyName: z.string().trim().max(120),
  preferredTiming: z
    .string()
    .trim()
    .min(1, "Tell us roughly when you would want a puppy."),
  message: z.string().trim().max(1500),

  /** Must be ticked. The guarantee is the thing people skip. */
  readGuarantee: z.literal(true, {
    message: "Please read the health guarantee before applying.",
  }),
});

export type ApplicationValues = z.infer<typeof applicationSchema>;

/** Which fields belong to which step, for per-step validation. */
export const STEP_FIELDS = [
  ["name", "email", "phone"],
  ["homeType", "hasYard", "yardFenced", "otherPets", "childrenAges", "timeAlone"],
  ["experience", "puppyName", "preferredTiming", "message", "readGuarantee"],
] as const satisfies readonly (readonly (keyof ApplicationValues)[])[];

export const STEP_TITLES = [
  "Who you are",
  "Where the dog would live",
  "You and the puppy",
] as const;
