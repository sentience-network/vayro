"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DailyBonusButton() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function claim() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/credits/daily", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not claim");
      setMessage(data.message);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not claim");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={claim}
        disabled={loading}
        className="rounded-md bg-lime px-4 py-2.5 text-sm font-bold text-ink disabled:opacity-50"
      >
        {loading ? "Claiming…" : "Claim daily credits"}
      </button>
      {message && <p className="mt-2 text-sm text-ink/60">{message}</p>}
    </div>
  );
}
