"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/apply/Field";
import { placeOrder } from "@/lib/actions/order";
import { orderSchema, type OrderValues } from "@/lib/schemas/order";
import { formatPrice } from "@/lib/format";
import { paymentMethods, siteConfig } from "@/lib/site-config";
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
  const [values, setValues] = useState<OrderValues>({
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    paymentMethod: "zelle",
    puppySlug,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [done, setDone] = useState<{
    reference: string;
    emailed: boolean;
  } | null>(null);

  const chosen = paymentMethods.find((m) => m.id === values.paymentMethod);

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
    setSubmitting(false);

    if (result.ok) setDone({ reference: result.reference, emailed: result.emailed });
    else setFailed(result.error);
  }

  // --- Placed ---------------------------------------------------------------

  if (done) {
    return (
      <div className="border border-enamel bg-ledger-bright p-7">
        <p className="eyebrow text-foxred">Order {done.reference}</p>
        <h2 className="mt-3 text-h2 text-spruce">
          Your order is placed. Nothing has been charged yet.
        </h2>

        <p className="measure mt-4 text-body text-canvas-deep">
          {done.emailed
            ? `We have emailed a receipt to ${values.buyerEmail} with the payment details on it.`
            : "Your order is recorded, but the receipt email did not go out. Call or text us and we will read the payment details to you."}
        </p>

        <div className="mt-7 border border-enamel bg-ledger p-5">
          <p className="eyebrow text-canvas-deep">
            Send {formatPrice(amountCents)} by {chosen?.label}
          </p>
          <p className="mt-3 font-mono text-body-l text-spruce">
            {chosen?.handle}
          </p>
          <p className="measure mt-3 text-small text-canvas-deep">
            {chosen?.instruction} Put{" "}
            <span className="font-mono text-spruce">{done.reference}</span> in
            the note so we can match it to your order.
          </p>
        </div>

        <p className="measure mt-6 border-l-2 border-brass pl-4 text-small text-canvas-deep">
          Check these details against what we have told you directly. If any
          message asks you to send money somewhere else, stop and call{" "}
          {siteConfig.contact.phone}. We will never ask you to change payment
          details by email.
        </p>

        <p className="mt-7">
          <Link
            href="/puppies"
            className="border-b border-brass pb-1 text-body text-spruce transition-colors duration-300 hover:border-foxred hover:text-foxred"
          >
            Back to the puppies
          </Link>
        </p>
      </div>
    );
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
        There is no deposit option. The full amount is due, and no money is
        taken on this website — you send it yourself from your own app once you
        have the details.
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
          help="Your receipt and payment details go here."
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
          help="We call every buyer before a puppy travels."
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
                    <span className="mt-1 block text-small text-canvas-deep">
                      {method.instruction}
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
          Nothing is charged now. You will get payment details on the next
          screen and by email.
        </p>
      </div>
    </form>
  );
}
