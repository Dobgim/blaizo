"use client";

import { useState } from "react";

/**
 * A price, entered in dollars.
 *
 * The column stores cents as an integer, which is right for the database and
 * wrong for a person: asking the owner to type 320000 for three thousand two
 * hundred dollars invites an expensive typo. This shows dollars and submits
 * cents through a hidden field.
 *
 * Rounding is explicit. 3200.005 becoming 320001 cents would be a silent
 * corruption, so the value is rounded once, here, and echoed back so the owner
 * can see exactly what will be saved.
 */
export function MoneyField({
  name,
  defaultCents,
}: {
  name: string;
  defaultCents: string;
}) {
  const initial = defaultCents ? String(Number(defaultCents) / 100) : "";
  const [dollars, setDollars] = useState(initial);

  const parsed = dollars.trim() === "" ? null : Number(dollars);
  const valid = parsed !== null && Number.isFinite(parsed) && parsed >= 0;
  const cents = valid ? String(Math.round(parsed * 100)) : "";

  return (
    <div className="mt-2">
      <input type="hidden" name={name} value={cents} />

      <div className="flex items-center gap-2">
        <span className="font-mono text-data text-canvas-deep">$</span>
        <input
          id={`f-${name}`}
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          value={dollars}
          onChange={(e) => setDollars(e.target.value)}
          placeholder="3200"
          className="w-full rounded-[2px] border border-enamel bg-ledger-bright px-3.5 py-2.5 text-body text-spruce transition-colors duration-200 hover:border-canvas"
        />
      </div>

      <p className="mt-2 text-small text-canvas-deep">
        {dollars.trim() === ""
          ? "Leave blank to show “Ask us” on the website instead of a number."
          : valid
            ? `Saved as ${Number(cents).toLocaleString("en-US")} cents, shown as $${Math.round(parsed).toLocaleString("en-US")}.`
            : "That is not a number we can save."}
      </p>
    </div>
  );
}
