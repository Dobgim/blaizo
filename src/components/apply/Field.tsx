"use client";

import { useId } from "react";
import type { ReactNode } from "react";

/**
 * One form control, with its label, help text and error wired together.
 *
 * The error is announced via aria-describedby and role="alert", and the input
 * is marked aria-invalid — so a screen reader user hears what to fix at the
 * moment it becomes wrong, not only when they reach the bottom of the form.
 */

const controlClasses = (invalid: boolean) =>
  [
    "w-full rounded-[2px] border bg-ledger-bright px-4 py-3 text-body text-spruce",
    "transition-colors duration-300 placeholder:text-canvas/60",
    invalid ? "border-foxred" : "border-enamel hover:border-canvas",
  ].join(" ");

type BaseProps = {
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  children?: ReactNode;
};

export function Field({
  label,
  help,
  error,
  required,
  render,
}: BaseProps & {
  render: (props: {
    id: string;
    className: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => ReactNode;
}) {
  const id = useId();
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="mb-7">
      <label htmlFor={id} className="eyebrow block text-canvas-deep">
        {label}
        {!required && <span className="ml-2 normal-case tracking-normal text-canvas">optional</span>}
      </label>

      {help && (
        <p id={helpId} className="mt-1.5 text-small text-canvas-deep">
          {help}
        </p>
      )}

      <div className="mt-2.5">
        {render({
          id,
          className: controlClasses(Boolean(error)),
          "aria-invalid": Boolean(error),
          "aria-describedby": describedBy,
        })}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-small font-medium text-foxred"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** A yes/no pair of radios. Two real radios, not a styled div. */
export function BooleanField({
  label,
  help,
  error,
  yesLabel = "Yes",
  noLabel = "No",
  value,
  onChange,
  name,
}: {
  label: string;
  help?: string;
  error?: string;
  yesLabel?: string;
  noLabel?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  name: string;
}) {
  return (
    <fieldset className="mb-7">
      <legend className="eyebrow text-canvas-deep">{label}</legend>
      {help && <p className="mt-1.5 text-small text-canvas-deep">{help}</p>}

      <div className="mt-3 flex gap-3">
        {[
          { label: yesLabel, v: true },
          { label: noLabel, v: false },
        ].map((opt) => (
          <label
            key={opt.label}
            className={[
              "cursor-pointer rounded-[2px] border px-5 py-2.5 text-small transition-colors duration-300",
              value === opt.v
                ? "border-spruce bg-spruce text-ledger"
                : "border-enamel bg-ledger-bright text-spruce hover:border-canvas",
            ].join(" ")}
          >
            <input
              type="radio"
              name={name}
              checked={value === opt.v}
              onChange={() => onChange(opt.v)}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-small font-medium text-foxred">
          {error}
        </p>
      )}
    </fieldset>
  );
}
