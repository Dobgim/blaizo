"use client";

import { useState, useTransition } from "react";
import { setOrderStatus } from "@/app/admin/actions";
import type { OrderStatus } from "@/lib/supabase/database.types";

const OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "placed", label: "Awaiting payment" },
  { value: "paid", label: "Payment received" },
  { value: "preparing", label: "Getting ready" },
  { value: "completed", label: "Gone home" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

/**
 * Where an order has got to.
 *
 * Moving it to "Payment received" also stamps paid_confirmed_at, because the
 * date the money actually arrived is the fact worth keeping — not the date
 * somebody happened to update a dropdown.
 */
export function OrderStatusSwitch({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const [current, setCurrent] = useState<OrderStatus>(status);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function change(next: OrderStatus) {
    const previous = current;
    setCurrent(next);
    setFailed(false);

    startTransition(async () => {
      const result = await setOrderStatus(id, next);
      if (!result.ok) {
        setCurrent(previous);
        setFailed(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor={`order-${id}`} className="sr-only">
        Order status
      </label>
      <select
        id={`order-${id}`}
        value={current}
        disabled={pending}
        onChange={(e) => change(e.target.value as OrderStatus)}
        className={[
          "rounded-[2px] border px-3 py-2 text-small transition-colors duration-200 disabled:opacity-60",
          current === "placed"
            ? "border-foxred bg-ledger-bright text-foxred"
            : current === "paid" || current === "completed"
              ? "border-spruce bg-spruce text-ledger"
              : "border-enamel bg-ledger-bright text-spruce",
        ].join(" ")}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {failed && (
        <span role="alert" className="text-small font-medium text-foxred">
          Not saved
        </span>
      )}
    </div>
  );
}
