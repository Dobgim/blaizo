"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

/**
 * Email and password sign-in.
 *
 * The error message is deliberately the same for a wrong password and an
 * unknown address — telling an attacker which addresses exist is a free gift.
 */
export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { error: authError } = await createClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(
        "That email address and password do not match an account. Check both and try again.",
      );
      setBusy(false);
      return;
    }

    /* refresh() lets the middleware see the new cookie before we navigate,
       otherwise it bounces straight back here. */
    router.refresh();
    router.replace(nextPath?.startsWith("/admin") ? nextPath : "/admin");
  }

  const inputClasses =
    "mt-2 w-full rounded-[2px] border border-enamel bg-ledger-bright px-4 py-3 text-body text-spruce transition-colors duration-200 hover:border-canvas";

  return (
    <form onSubmit={onSubmit} className="mt-8">
      <label htmlFor="email" className="eyebrow block text-canvas-deep">
        Email
      </label>
      <input
        id="email"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClasses}
      />

      <label
        htmlFor="password"
        className="eyebrow mt-6 block text-canvas-deep"
      >
        Password
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputClasses}
      />

      {error && (
        <p role="alert" className="mt-5 text-small font-medium text-foxred">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={busy} className="mt-8 w-full">
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
