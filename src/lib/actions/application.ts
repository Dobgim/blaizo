"use server";

import { createClient } from "@/lib/supabase/server";
import { sendViaWeb3Forms } from "@/lib/web3forms";
import { siteConfig } from "@/lib/site-config";
import {
  applicationSchema,
  type ApplicationValues,
} from "@/lib/schemas/application";

/**
 * Records the application in the owner's inbox.
 *
 * This is a copy, not a gate. The visitor's actual message goes to WhatsApp,
 * and the hand-off must happen whether or not this insert succeeds — losing a
 * lead because a database was briefly unreachable would be the worst possible
 * trade. So every failure path returns ok:false and the client carries on.
 */
export async function submitApplication(
  values: ApplicationValues,
): Promise<{ ok: boolean; id?: string }> {
  const parsed = applicationSchema.safeParse(values);
  if (!parsed.success) return { ok: false };

  const v = parsed.data;

  /* The email goes out regardless of whether the database is reachable — the
     owner seeing the application matters more than our record of it, and the
     two failure modes are unrelated. Neither blocks the WhatsApp hand-off. */
  const emails = sendViaWeb3Forms({
    subject: `Application — ${v.name}`,
    fromName: `${siteConfig.shortName} website`,
    replyTo: v.email,
    fields: {
      Name: v.name,
      Email: v.email,
      Phone: v.phone,
      "Puppy of interest": v.puppyName || "No particular puppy yet",
      Home: v.homeType,
      Yard: v.hasYard
        ? v.yardFenced
          ? "Yes, fenced"
          : "Yes, not fenced"
        : "No yard",
      "Other pets": v.otherPets || "None",
      "Children at home": v.childrenAges || "None",
      "Hours alone on a typical day": v.timeAlone,
      Timing: v.preferredTiming,
      "Experience with the breed": v.experience,
      "Anything else": v.message || "—",
    },
  });

  const supabase = await createClient();
  if (!supabase) {
    await emails;
    return { ok: false };
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      name: v.name,
      email: v.email,
      phone: v.phone,
      home_type: v.homeType,
      has_yard: v.hasYard,
      yard_fenced: v.yardFenced,
      other_pets: v.otherPets || null,
      children_ages: v.childrenAges || null,
      experience: v.experience,
      time_alone: v.timeAlone,
      preferred_timing: v.preferredTiming,
      message: v.message || null,
      puppy_id: null,
      litter_id: null,
      handoff_opened_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  await emails;

  if (error) {
    console.error(`[apply] could not record application: ${error.message}`);
    return { ok: false };
  }

  return { ok: true, id: data.id };
}
