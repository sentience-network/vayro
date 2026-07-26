"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EarnCreditsPanel() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function watchPartner() {
    setLoading(true);
    setMessage(null);
    try {
      // Simulate a short watch, then record reward
      await new Promise((r) => setTimeout(r, 2500));
      const res = await fetch("/api/ads/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerBonus: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reward failed");
      setMessage(
        `+${data.adView.creditReward} credits from ${data.adView.partnerName}. Balance: ${data.credits}`
      );
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Reward failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white/50 p-6">
      <p className="font-display text-2xl font-bold text-ink">Partner ad rewards</p>
      <p className="mt-2 text-sm text-ink/60">
        Credits are earned — never sold. Watch partner spots for bonus credits you can spend on
        predictions.
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={watchPartner}
        className="mt-4 rounded-md bg-tide px-4 py-2.5 text-sm font-semibold text-foam disabled:opacity-50"
      >
        {loading ? "Watching partner ad…" : "Earn partner reward"}
      </button>
      {message && <p className="mt-3 text-sm text-ink/65">{message}</p>}
    </div>
  );
}
