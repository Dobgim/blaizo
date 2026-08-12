"use server";

import { createClient } from "@/lib/supabase/server";
import {
  sendApplicantConfirmation,
  sendOwnerNotification,
} from "@/lib/email";
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

  /* Email goes out regardless of whether the database is reachable — the
     owner's copy of an application matters more than our record of it, and
     these two failure modes are unrelated. Neither blocks the hand-off. */
  const emails = Promise.allSettled([
    sendOwnerNotification(v),
    sendApplicantConfirmation(v),
  ]);

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
