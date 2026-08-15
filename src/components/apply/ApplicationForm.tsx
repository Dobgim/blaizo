"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { BooleanField, Field } from "@/components/apply/Field";
import { submitApplication } from "@/lib/actions/application";
import {
  applicationSchema,
  STEP_FIELDS,
  STEP_TITLES,
  type ApplicationValues,
} from "@/lib/schemas/application";
import { applicationMessage, whatsappUrl } from "@/lib/whatsapp";

/**
 * The application, in three steps.
 *
 * Nothing is charged. On submit the answers are recorded in the owner's inbox
 * and then WhatsApp opens with the whole application already written out, so
 * the visitor sends it in one tap.
 *
 * The hand-off is never blocked on the database. If the insert fails the
 * visitor still gets their WhatsApp message — losing a lead to a transient
 * error would be the worst trade available here.
 */
export function ApplicationForm({ puppyName }: { puppyName?: string }) {
  const [step, setStep] = useState(0);
  const [handoff, setHandoff] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      homeType: "",
      hasYard: true,
      yardFenced: true,
      otherPets: "",
      childrenAges: "",
      timeAlone: "",
      experience: "",
      puppyName: puppyName ?? "",
      preferredTiming: "",
      message: "",
    },
  });

  async function next() {
    const valid = await trigger(STEP_FIELDS[step] as never, {
      shouldFocus: true,
    });
    if (valid) setStep((s) => Math.min(s + 1, STEP_FIELDS.length - 1));
  }

  async function onSubmit(values: ApplicationValues) {
    const message = applicationMessage({
      name: values.name,
      email: values.email,
      phone: values.phone,
      puppyName: values.puppyName || null,
      litterId: null,
      homeType: values.homeType,
      hasYard: values.hasYard,
      yardFenced: values.yardFenced,
      otherPets: values.otherPets,
      childrenAges: values.childrenAges,
      experience: values.experience,
      timeAlone: values.timeAlone,
      preferredTiming: values.preferredTiming,
      message: values.message,
    });

    // Best effort. The hand-off happens either way.
    await submitApplication(values).catch(() => ({ ok: false }));

    const url = whatsappUrl(message);
    setHandoff(url);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // --- Sent -----------------------------------------------------------------

  if (handoff) {
    return (
      <div className="border border-enamel bg-ledger-bright p-8">
        <p className="eyebrow text-foxred">Last step</p>
        <h2 className="mt-4 text-h2 text-spruce">
          WhatsApp should have opened in a new tab
        </h2>
        <p className="measure mt-4 text-body text-canvas-deep">
          Your answers are already written into the message. Press send and we
          have everything we need — you do not have to type anything else.
          Nothing has been charged: applying is free and separate from ordering.
        </p>
        <p className="mt-7">
          <a
            href={handoff}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-brass pb-1 text-body-l text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
          >
            If it did not open, tap here
          </a>
        </p>
      </div>
    );
  }

  // --- Form -----------------------------------------------------------------

  const isLast = step === STEP_FIELDS.length - 1;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Step indicator. A genuine sequence, so numbering is earned. */}
      <ol className="hairline mb-10 flex flex-wrap gap-x-8 gap-y-2 pt-5">
        {STEP_TITLES.map((title, i) => (
          <li key={title} className="flex items-baseline gap-2.5">
            <span
              className={[
                "font-mono text-data",
                i === step ? "text-foxred" : "text-canvas",
              ].join(" ")}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              aria-current={i === step ? "step" : undefined}
              className={[
                "eyebrow",
                i === step ? "text-spruce" : "text-canvas",
              ].join(" ")}
            >
              {title}
            </span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <fieldset>
          <legend className="sr-only">Who you are</legend>
          <Field
            label="Your full name"
            error={errors.name?.message}
            required
            render={(p) => <input type="text" autoComplete="name" {...p} {...register("name")} />}
          />
          <Field
            label="Email"
            help="Where the paperwork goes if we place a puppy with you."
            error={errors.email?.message}
            required
            render={(p) => <input type="email" autoComplete="email" {...p} {...register("email")} />}
          />
          <Field
            label="Phone"
            help="We will always talk before we place a dog."
            error={errors.phone?.message}
            required
            render={(p) => <input type="tel" autoComplete="tel" {...p} {...register("phone")} />}
          />
        </fieldset>
      )}

      {step === 1 && (
        <fieldset>
          <legend className="sr-only">Where the dog would live</legend>
          <Field
            label="What kind of home is it?"
            help="A house, an apartment, a farm — and roughly where."
            error={errors.homeType?.message}
            required
            render={(p) => <input type="text" {...p} {...register("homeType")} />}
          />

          <Controller
            control={control}
            name="hasYard"
            render={({ field }) => (
              <BooleanField
                name="hasYard"
                label="Is there a yard or land?"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="yardFenced"
            render={({ field }) => (
              <BooleanField
                name="yardFenced"
                label="Is it fenced?"
                help="Not a deal-breaker. It changes what we say about the first six months."
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Field
            label="Other pets"
            help="Species, rough ages, and how they are with dogs."
            error={errors.otherPets?.message}
            render={(p) => <input type="text" {...p} {...register("otherPets")} />}
          />
          <Field
            label="Children at home"
            help="Ages, if any. It genuinely affects which puppy we suggest."
            error={errors.childrenAges?.message}
            render={(p) => <input type="text" {...p} {...register("childrenAges")} />}
          />
          <Field
            label="Hours alone on a typical day"
            help="Be honest. Everybody works — we would rather plan around the real number."
            error={errors.timeAlone?.message}
            required
            render={(p) => <input type="text" {...p} {...register("timeAlone")} />}
          />
        </fieldset>
      )}

      {step === 2 && (
        <fieldset>
          <legend className="sr-only">You and the puppy</legend>
          <Field
            label="Have you had a dog of this breed before?"
            help="First-time owners are welcome. We just adjust what we tell you."
            error={errors.experience?.message}
            required
            render={(p) => <textarea rows={5} {...p} {...register("experience")} />}
          />
          <Field
            label="A particular puppy?"
            help="Leave it blank if you are open, or waiting for a future litter."
            error={errors.puppyName?.message}
            render={(p) => <input type="text" {...p} {...register("puppyName")} />}
          />
          <Field
            label="When would you want a puppy?"
            help="A season and a year is enough."
            error={errors.preferredTiming?.message}
            required
            render={(p) => <input type="text" {...p} {...register("preferredTiming")} />}
          />
          <Field
            label="Anything else"
            error={errors.message?.message}
            render={(p) => <textarea rows={4} {...p} {...register("message")} />}
          />

          <div className="mb-7">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                {...register("readGuarantee")}
                className="mt-1 size-4 shrink-0 accent-[var(--color-spruce)]"
                aria-invalid={Boolean(errors.readGuarantee)}
              />
              <span className="text-body text-spruce">
                I have read the{" "}
                <Link
                  href="/process/guarantee"
                  target="_blank"
                  className="text-foxred underline decoration-brass underline-offset-4"
                >
                  health guarantee
                </Link>
                , including the parts about what is not covered.
              </span>
            </label>
            {errors.readGuarantee && (
              <p role="alert" className="mt-2 text-small font-medium text-foxred">
                {errors.readGuarantee.message}
              </p>
            )}
          </div>
        </fieldset>
      )}

      {/* --- Controls --- */}
      <div className="hairline flex flex-wrap items-center gap-4 pt-7">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
        )}

        {isLast ? (
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Finish on WhatsApp"}
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={next}>
            Continue
          </Button>
        )}

        <p className="text-small text-canvas-deep">
          Step {step + 1} of {STEP_FIELDS.length} · free, and commits you to nothing
        </p>
      </div>
    </form>
  );
}
