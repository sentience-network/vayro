"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResolvePanel({
  slug,
  options,
}: {
  slug: string;
  options: string[];
}) {
  const router = useRouter();
  const [resolvedOption, setResolvedOption] = useState(options[0] ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resolve() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/markets/${slug}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolvedOption }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resolve failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resolve failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-ember/30 bg-sand/70 p-6">
      <p className="font-display text-2xl font-bold text-ink">Resolve market</p>
      <p className="mt-2 text-sm text-ink/60">
        Creators set the official outcome. Ad revenue then cascades through the Betme waterfall.
      </p>
      <select
        className="mt-4 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
        value={resolvedOption}
        onChange={(e) => setResolvedOption(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="mt-3 text-sm text-ember">{error}</p>}
      <button
        type="button"
        disabled={loading}
        onClick={resolve}
        className="mt-4 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-lime disabled:opacity-50"
      >
        {loading ? "Resolving…" : "Resolve & distribute"}
      </button>
    </div>
  );
}
