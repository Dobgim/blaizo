"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Photograph upload, straight from a phone.
 *
 * `accept="image/*"` alone gives an iPhone the choice of Camera, Photo Library
 * or Files, which is what the owner wants standing in the whelping room.
 * `capture` is deliberately NOT set — it would force the camera and remove the
 * option of picking a shot taken earlier.
 *
 * The file goes to the public `photos` bucket and the field stores the
 * resulting URL, so the value is a plain string exactly as a pasted URL was.
 * That keeps the form's contract unchanged: the server action still just reads
 * a text input.
 *
 * Uploads are named with a random suffix rather than the original filename —
 * phone cameras produce IMG_0001.jpg by the hundred, and Supabase Storage
 * would either collide or silently overwrite.
 */

const MAX_BYTES = 10 * 1024 * 1024;

function extensionOf(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  return file.type.split("/")[1] ?? "jpg";
}

export function ImageField({
  name,
  defaultValue,
  multiple = false,
}: {
  name: string;
  defaultValue: string;
  multiple?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  /* Selecting a dozen photos from a phone over mobile data takes a while.
     Without a count the owner cannot tell a slow upload from a stuck one. */
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const urls = multiple
    ? value.split("\n").map((v) => v.trim()).filter(Boolean)
    : value.trim()
      ? [value.trim()]
      : [];

  async function upload(files: FileList) {
    setBusy(true);
    setError(null);
    setProgress({ done: 0, total: files.length });

    try {
      const supabase = createClient();
      const uploaded: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image.`);
        }
        if (file.size > MAX_BYTES) {
          throw new Error(
            `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 10MB — most phones can send a smaller copy.`,
          );
        }

        const path = `${name}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionOf(file)}`;

        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(path, file, { cacheControl: "31536000", upsert: false });

        if (uploadError) throw new Error(uploadError.message);

        const { data } = supabase.storage.from("photos").getPublicUrl(path);
        uploaded.push(data.publicUrl);
        setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      }

      setValue((current) => {
        if (!multiple) return uploaded[uploaded.length - 1];
        const existing = current.split("\n").map((v) => v.trim()).filter(Boolean);
        return [...existing, ...uploaded].join("\n");
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "That upload did not work. Try again.",
      );
    } finally {
      setBusy(false);
      setProgress({ done: 0, total: 0 });
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    const next = urls.filter((_, i) => i !== index);
    setValue(next.join("\n"));
  }

  return (
    <div className="mt-2">
      {/* The real form value. The server action reads this and nothing else. */}
      <input type="hidden" name={name} value={value} />

      {urls.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-3">
          {urls.map((url, i) => (
            <li key={`${url}-${i}`} className="relative">
              <span className="block size-24 overflow-hidden border border-enamel bg-ledger-bright">
                {/* A plain img: these are user uploads on an internal screen,
                    and routing them through the optimiser would cost a
                    transform per thumbnail for no benefit. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full border border-enamel bg-ledger text-spruce transition-colors duration-200 hover:bg-foxred hover:text-ledger"
              >
                <span aria-hidden className="text-[0.9rem] leading-none">
                  ×
                </span>
                <span className="sr-only">Remove this photograph</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <label
        className={[
          "inline-flex min-h-11 cursor-pointer items-center rounded-[2px] border px-5 text-small transition-colors duration-200",
          busy
            ? "border-enamel text-canvas"
            : "border-spruce text-spruce hover:bg-spruce hover:text-ledger",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          disabled={busy}
          onChange={(e) => {
            if (e.target.files?.length) void upload(e.target.files);
          }}
          className="sr-only"
        />
        {busy
          ? progress.total > 1
            ? `Uploading ${progress.done + 1} of ${progress.total}…`
            : "Uploading…"
          : urls.length > 0
            ? multiple
              ? "Add more photographs"
              : "Replace photograph"
            : multiple
              ? "Upload photographs"
              : "Upload a photograph"}
      </label>

      <p className="mt-2 text-small text-canvas-deep">
        Take a photo or choose from your phone.
        {multiple ? " Select as many as you like at once — tap each one." : ""}{" "}
        JPEG or PNG, up to 10MB each.
      </p>

      {error && (
        <p role="alert" className="mt-2 text-small font-medium text-foxred">
          {error}
        </p>
      )}
    </div>
  );
}
