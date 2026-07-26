"use client";

import { useEffect, useState } from "react";

type AdPayload = {
  id: string;
  partnerName: string;
  tagline: string;
  color: string;
  revenueCents: number;
  creditReward: number;
};

type AdGateProps = {
  marketId: string;
  onComplete: (adViewId: string) => void;
  disabled?: boolean;
};

export function AdGate({ marketId, onComplete, disabled }: AdGateProps) {
  const [phase, setPhase] = useState<"idle" | "watching" | "done">("idle");
  const [ad, setAd] = useState<AdPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "watching") return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/ads/watch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ marketId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ad failed");
        setAd(data.adView);
        setPhase("done");
        onComplete(data.adView.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ad failed");
        setPhase("idle");
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [phase, marketId, onComplete]);

  if (phase === "watching") {
    return (
      <div
        className="overflow-hidden rounded-2xl border border-white/10 p-6 text-foam shadow-glow"
        style={{ background: "linear-gradient(145deg, #0b3d34, #12352b 55%, #1f7a63)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime/80">
          Partner ad · unlock entry
        </p>
        <p className="mt-3 font-display text-3xl font-extrabold">Watching…</p>
        <p className="mt-2 text-sm text-foam/70">
          Stay with it — this view funds the market ad pool and earns you Betme credits.
        </p>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div className="ad-progress h-full rounded-full bg-lime" />
        </div>
      </div>
    );
  }

  if (phase === "done" && ad) {
    return (
      <div
        className="rounded-2xl p-6 text-foam"
        style={{ background: `linear-gradient(145deg, ${ad.color}, #071a14)` }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime/90">
          Ad complete · +{ad.creditReward} credits
        </p>
        <p className="mt-3 font-display text-3xl font-extrabold">{ad.partnerName}</p>
        <p className="mt-2 text-sm text-foam/75">{ad.tagline}</p>
        <p className="mt-4 text-sm text-lime">
          ${(ad.revenueCents / 100).toFixed(2)} added to this market&apos;s ad pool
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white/50 p-6">
      <p className="font-display text-2xl font-bold text-ink">Watch an ad to enter</p>
      <p className="mt-2 text-sm leading-relaxed text-ink/60">
        Every participant watches a short partner ad. That ad revenue becomes the shared pool —
        Betme, the creator, accurate predictors, then everyone else.
      </p>
      {error && <p className="mt-3 text-sm text-ember">{error}</p>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setError(null);
          setPhase("watching");
        }}
        className="mt-5 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-lime transition hover:bg-ink-soft disabled:opacity-50"
      >
        Play partner ad
      </button>
    </div>
  );
}
