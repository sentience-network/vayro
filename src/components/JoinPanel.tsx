"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AdGate } from "./AdGate";

type JoinPanelProps = {
  marketId: string;
  slug: string;
  options: string[];
  entryFee: number;
  credits: number;
  alreadyJoined: boolean;
};

export function JoinPanel({
  marketId,
  slug,
  options,
  entryFee,
  credits,
  alreadyJoined,
}: JoinPanelProps) {
  const router = useRouter();
  const [adViewId, setAdViewId] = useState<string | null>(null);
  const [choice, setChoice] = useState(options[0] ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAdComplete = useCallback((id: string) => setAdViewId(id), []);

  if (alreadyJoined) {
    return (
      <div className="rounded-2xl border border-tide/25 bg-mist/60 p-6">
        <p className="font-display text-2xl font-bold text-ink">You&apos;re in</p>
        <p className="mt-2 text-sm text-ink/60">
          Your prediction is locked. Watch more partner ads from your dashboard to bump activity
          and grow your share weight.
        </p>
      </div>
    );
  }

  async function join() {
    if (!adViewId) {
      setError("Watch the partner ad first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/markets/${slug}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice, adViewId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Join failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Join failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <AdGate marketId={marketId} onComplete={onAdComplete} />

      <div className="rounded-2xl border border-[var(--line)] bg-white/55 p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-2xl font-bold text-ink">Make your call</p>
            <p className="mt-1 text-sm text-ink/55">
              Flat fee · {entryFee} credits · you have {credits}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setChoice(option)}
              className={`rounded-md border px-4 py-3 text-left text-sm font-semibold transition ${
                choice === option
                  ? "border-ink bg-ink text-lime"
                  : "border-[var(--line)] bg-foam/70 text-ink hover:border-tide/40"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-ember">{error}</p>}

        <button
          type="button"
          disabled={loading || !adViewId || credits < entryFee}
          onClick={join}
          className="mt-5 w-full rounded-md bg-lime px-4 py-3 text-sm font-bold text-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {credits < entryFee
            ? "Need more credits"
            : loading
              ? "Entering…"
              : `Enter for ${entryFee} credits`}
        </button>
      </div>
    </div>
  );
}
