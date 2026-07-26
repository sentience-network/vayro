"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload =
      mode === "login"
        ? {
            email: String(form.get("email") || ""),
            password: String(form.get("password") || ""),
          }
        : {
            email: String(form.get("email") || ""),
            username: String(form.get("username") || ""),
            displayName: String(form.get("displayName") || ""),
            password: String(form.get("password") || ""),
          };

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4">
      {mode === "signup" && (
        <>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Display name
            </span>
            <input
              name="displayName"
              required
              className="mt-1.5 w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5"
              placeholder="Maya Voss"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Username
            </span>
            <input
              name="username"
              required
              pattern="[A-Za-z0-9_]+"
              className="mt-1.5 w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5"
              placeholder="maya"
            />
          </label>
        </>
      )}
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1.5 w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5"
          placeholder="you@email.com"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1.5 w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5"
          placeholder="••••••••"
        />
      </label>

      {mode === "signup" && (
        <p className="rounded-md bg-mist/80 px-3 py-2 text-sm text-ink/70">
          Signup grants <strong>100 Betme credits</strong>. Credits cannot be purchased — only
          earned.
        </p>
      )}

      {error && <p className="text-sm text-ember">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-ink px-4 py-3 text-sm font-bold text-lime transition hover:bg-ink-soft disabled:opacity-50"
      >
        {loading ? "Working…" : mode === "login" ? "Log in" : "Create account & earn credits"}
      </button>

      <p className="text-center text-sm text-ink/55">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link className="font-semibold text-tide" href="/signup">
              Earn signup credits
            </Link>
          </>
        ) : (
          <>
            Already in?{" "}
            <Link className="font-semibold text-tide" href="/login">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
