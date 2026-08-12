"use client";

import { useTransition, useState } from "react";
import { togglePublished } from "@/app/admin/actions";

/**
 * Publish switch, straight from the list row.
 *
 * Optimistic in appearance but honest about failure: if the write is rejected
 * the label snaps back and says so, rather than leaving the owner believing a
 * dog is live when it is not.
 */
export function PublishToggle({
  resourceKey,
  id,
  published,
}: {
  resourceKey: string;
  id: string;
  published: boolean;
}) {
  const [on, setOn] = useState(published);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    setFailed(false);

    startTransition(async () => {
      const result = await togglePublished(resourceKey, id, next);
      if (!result.ok) {
        setOn(!next);
        setFailed(true);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={on}
      className={[
        "eyebrow rounded-[2px] border px-2.5 py-1 transition-colors duration-200 disabled:opacity-60",
        failed
          ? "border-foxred text-foxred"
          : on
            ? "border-spruce bg-spruce text-ledger"
            : "border-enamel text-canvas-deep hover:border-canvas",
      ].join(" ")}
    >
      {failed ? "Failed" : on ? "Live" : "Draft"}
    </button>
  );
}
