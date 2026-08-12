"use client";

import { useState, useTransition } from "react";
import { setPuppyStatus } from "@/app/admin/actions";

type Status = "available" | "reserved" | "placed";

const OPTIONS: { value: Status; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "placed", label: "Placed" },
];

/**
 * The one-click status flip.
 *
 * Three real buttons rather than a select, because the whole point is that it
 * takes one press. If the write fails the previous value comes back and the
 * failure is stated — never leave the owner thinking a puppy is reserved when
 * the site still says available.
 */
export function PuppyStatusSwitch({
  id,
  status,
}: {
  id: string;
  status: Status;
}) {
  const [current, setCurrent] = useState<Status>(status);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function choose(next: Status) {
    if (next === current) return;
    const previous = current;
    setCurrent(next);
    setFailed(false);

    startTransition(async () => {
      const result = await setPuppyStatus(id, next);
      if (!result.ok) {
        setCurrent(previous);
        setFailed(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <div
        role="group"
        aria-label="Status"
        className="flex overflow-hidden rounded-[2px] border border-enamel"
      >
        {OPTIONS.map((opt) => {
          const active = opt.value === current;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => choose(opt.value)}
              disabled={pending}
              aria-pressed={active}
              className={[
                "eyebrow px-3 py-1.5 transition-colors duration-200 disabled:opacity-60",
                active
                  ? opt.value === "available"
                    ? "bg-foxred text-ledger"
                    : opt.value === "reserved"
                      ? "bg-brass text-spruce"
                      : "bg-canvas text-ledger"
                  : "bg-ledger-bright text-canvas-deep hover:text-spruce",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {failed && (
        <span role="alert" className="text-small font-medium text-foxred">
          Not saved — try again
        </span>
      )}
    </div>
  );
}
