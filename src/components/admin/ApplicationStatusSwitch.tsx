"use client";

import { useState, useTransition } from "react";
import { setApplicationStatus } from "@/app/admin/actions";

type Status =
  | "new"
  | "reading"
  | "contacted"
  | "matched"
  | "declined"
  | "withdrawn";

const OPTIONS: { value: Status; label: string }[] = [
  { value: "new", label: "New" },
  { value: "reading", label: "Reading" },
  { value: "contacted", label: "Contacted" },
  { value: "matched", label: "Matched" },
  { value: "declined", label: "Declined" },
  { value: "withdrawn", label: "Withdrawn" },
];

/**
 * Where this conversation has got to.
 *
 * Six states is more than three, so this one is a select rather than a button
 * group — a row of six buttons per application would swamp the inbox.
 */
export function ApplicationStatusSwitch({
  id,
  status,
}: {
  id: string;
  status: Status;
}) {
  const [current, setCurrent] = useState<Status>(status);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function change(next: Status) {
    const previous = current;
    setCurrent(next);
    setFailed(false);

    startTransition(async () => {
      const result = await setApplicationStatus(id, next);
      if (!result.ok) {
        setCurrent(previous);
        setFailed(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor={`status-${id}`} className="sr-only">
        Application status
      </label>
      <select
        id={`status-${id}`}
        value={current}
        disabled={pending}
        onChange={(e) => change(e.target.value as Status)}
        className={[
          "rounded-[2px] border px-3 py-1.5 text-small transition-colors duration-200 disabled:opacity-60",
          current === "new"
            ? "border-foxred bg-ledger-bright text-foxred"
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
