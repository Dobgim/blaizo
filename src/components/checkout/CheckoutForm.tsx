"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/apply/Field";
import { placeOrder } from "@/lib/actions/order";
import { postToWeb3Forms } from "@/lib/web3forms";
import { invoicePath, stashInvoice } from "@/lib/invoice";
import { orderSchema, type OrderValues } from "@/lib/schemas/order";
import { formatPrice } from "@/lib/format";
import { paymentMethods } from "@/lib/site-config";
import type { PaymentMethodId } from "@/lib/supabase/database.types";

/**
 * The order form.
 *
 * One screen, four fields, a payment choice, and the full price stated before
 * anything is filled in. There is no deposit option — the kennel takes the
 * whole amount or nothing — so the total never changes as you go, which is
 * the only honest way to show a single-price checkout.
 *
 * Nothing is charged here. Every method is a transfer the buyer makes from
 * their own app afterwards, so "Place order" records the order and sends the
 * details; it does not move money, and the button says so.
 */
export function CheckoutForm({
  puppySlug,
  puppyName,
  amountCents,
}: {
  puppySlug: string;
  puppyName: string;
  amountCents: number;
}) {
  const router = useRouter();
  const [values, setValues] = useState<OrderValues>({
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    buyerLocation: "",
    paymentMethod: "zelle",
    puppySlug,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  function set<K extends keyof OrderValues>(key: K, value: OrderValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFailed(null);

    const parsed = orderSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const result = await placeOrder(parsed.data);
    if (!result.ok) {
      setSubmitting(false);
      setFailed(result.error);
      return;
    }

    /* The order is recorded by this point, so this email is a notification
       rather than the record. Awaited so the request finishes before we
       navigate away, and so a failure is visible in the console instead of
       disappearing silently. */
    const delivery = await postToWeb3Forms(result.message);
    if (delivery.sent !== true) {
      console.error(
        `[checkout] order ${result.reference} saved, but the email did not confirm: ${delivery.reason}`,
      );
    }

    /* The invoice travels in sessionStorage, not the URL — it carries the
       buyer's address. Written before navigating so it is there when the
       invoice page mounts. */
    stashInvoice(result.invoice);

    /* Our own confirmation, not one served by a third party. The buyer's
       invoice must survive Web3Forms being slow, blocked or down. */
    router.push(invoicePath(result.reference));
  }

  // --- Form -----------------------------------------------------------------

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* The total, stated before anything is asked for. */}
      <div className="hairline flex flex-wrap items-baseline justify-between gap-3 pt-5">
        <div>
          <p className="eyebrow text-canvas-deep">Ordering</p>
          <p className="mt-1 font-display text-h3 text-spruce">{puppyName}</p>
        </div>
        <div className="text-right">
          <p className="eyebrow text-canvas-deep">Total, paid in full</p>
          <p className="mt-1 font-mono text-h3 text-spruce">
            {formatPrice(amountCents)}
          </p>
        </div>
      </div>

      <p className="measure mt-4 text-small text-canvas-deep">
        There is no deposit option — the full amount is due. No money is taken
        on this website: we will call you and give you the payment details
        ourselves.
      </p>

      <div className="mt-9">
        <Field
          label="Full name"
          help="As it appears on the account you will pay from."
          error={errors.buyerName}
          required
          render={(p) => (
            <input
              type="text"
              autoComplete="name"
              value={values.buyerName}
              onChange={(e) => set("buyerName", e.target.value)}
              {...p}
            />
          )}
        />

        <Field
          label="Email"
          help="We use it to confirm your order in writing."
          error={errors.buyerEmail}
          required
          render={(p) => (
            <input
              type="email"
              autoComplete="email"
              value={values.buyerEmail}
              onChange={(e) => set("buyerEmail", e.target.value)}
              {...p}
            />
          )}
        />

        <Field
          label="Phone"
          help="We call you with the payment details, so make sure it is right."
          error={errors.buyerPhone}
          required
          render={(p) => (
            <input
              type="tel"
              autoComplete="tel"
              value={values.buyerPhone}
              onChange={(e) => set("buyerPhone", e.target.value)}
              {...p}
            />
          )}
        />

        {/* A textarea rather than the usual four boxes: this is the billing
            address on the invoice, and it also tells us how far the puppy is
            travelling. People type their own address more accurately than a
            form makes them fill it in. */}
        <Field
          label="Address"
          help="Where you are — this goes on your invoice as the billing address."
          error={errors.buyerLocation}
          required
          render={(p) => (
            <textarea
              rows={3}
              autoComplete="street-address"
              placeholder={"123 Example Street\nTown, State 00000"}
              value={values.buyerLocation}
              onChange={(e) => set("buyerLocation", e.target.value)}
              {...p}
            />
          )}
        />

        {/* Payment choice. Real radios in a fieldset, so it is one control to
            a screen reader and arrow keys move between the options. */}
        <fieldset className="mb-7">
          <legend className="eyebrow text-canvas-deep">How would you like to pay?</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((method) => {
              const active = values.paymentMethod === method.id;
              return (
                <label
                  key={method.id}
                  className={[
                    "flex cursor-pointer items-start gap-3 rounded-[2px] border p-4 transition-colors duration-200",
                    active
                      ? "border-spruce bg-ledger-bright"
                      : "border-enamel hover:border-canvas",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={active}
                    onChange={() =>
                      set("paymentMethod", method.id as PaymentMethodId)
                    }
                    className="mt-1 size-4 shrink-0 accent-[var(--color-spruce)]"
                  />
                  <span>
                    <span className="block text-body font-medium text-spruce">
                      {method.label}
                    </span>

                  </span>
                </label>
              );
            })}
          </div>
          {errors.paymentMethod && (
            <p role="alert" className="mt-2 text-small font-medium text-foxred">
              {errors.paymentMethod}
            </p>
          )}
        </fieldset>

        <Field
          label="Anything we should know"
          error={errors.notes}
          render={(p) => (
            <textarea
              rows={3}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              {...p}
            />
          )}
        />
      </div>

      {failed && (
        <p
          role="alert"
          className="mb-6 border-l-2 border-foxred bg-ledger-bright px-4 py-3 text-small font-medium text-foxred"
        >
          {failed}
        </p>
      )}

      <div className="hairline flex flex-wrap items-center gap-4 pt-6">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Placing your order…" : "Place order"}
        </Button>
        <p className="text-small text-canvas-deep">
          Nothing is charged now. We will call you with the payment details.
        </p>
      </div>
    </form>
  );
}
