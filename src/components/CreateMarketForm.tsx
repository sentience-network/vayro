"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, DEFAULT_ENTRY_FEE } from "@/lib/constants";

export function CreateMarketForm() {
  const router = useRouter();
  const [options, setOptions] = useState(["Yes", "No"]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const resolvesLocal = String(form.get("resolvesAt") || "");
    const resolvesAt = new Date(resolvesLocal).toISOString();

    try {
      const res = await fetch("/api/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: String(form.get("title") || ""),
          description: String(form.get("description") || ""),
          category: String(form.get("category") || "Other"),
          entryFee: Number(form.get("entryFee") || DEFAULT_ENTRY_FEE),
          options: options.map((o) => o.trim()).filter(Boolean),
          resolvesAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create market");
      router.push(`/markets/${data.market.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create market");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
          Prediction title
        </span>
        <input
          name="title"
          required
          minLength={8}
          className="mt-1.5 w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5"
          placeholder="Will the city marathon sell out by Friday?"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
          Why this matters
        </span>
        <textarea
          name="description"
          required
          minLength={20}
          rows={4}
          className="mt-1.5 w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5"
          placeholder="Give people enough context to make a thoughtful call. Attractive markets earn you creator ad share."
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
            Category
          </span>
          <select
            name="category"
            className="mt-1.5 w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5"
            defaultValue="Culture"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
            Flat entry fee (credits)
          </span>
          <input
            name="entryFee"
            type="number"
            min={5}
            max={50}
            defaultValue={DEFAULT_ENTRY_FEE}
            className="mt-1.5 w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
          Resolves at
        </span>
        <input
          name="resolvesAt"
          type="datetime-local"
          required
          className="mt-1.5 w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5"
        />
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
            Outcomes
          </span>
          <button
            type="button"
            className="text-sm font-semibold text-tide"
            onClick={() => setOptions((prev) => (prev.length < 6 ? [...prev, ""] : prev))}
          >
            Add option
          </button>
        </div>
        <div className="space-y-2">
          {options.map((option, index) => (
            <input
              key={index}
              value={option}
              onChange={(e) =>
                setOptions((prev) => prev.map((o, i) => (i === index ? e.target.value : o)))
              }
              required
              className="w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5"
              placeholder={`Option ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <p className="rounded-md bg-mist/70 px-3 py-2 text-sm text-ink/65">
        Posting a market earns <strong>+25 credits</strong>. Your creator share grows when more
        people watch ads to join.
      </p>

      {error && <p className="text-sm text-ember">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink px-5 py-3 text-sm font-bold text-lime disabled:opacity-50"
      >
        {loading ? "Publishing…" : "Publish prediction"}
      </button>
    </form>
  );
}
