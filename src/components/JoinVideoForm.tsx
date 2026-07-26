"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function JoinVideoForm() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    router.push(`/video/${clean}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/50 p-5">
      <p className="font-display text-xl font-bold">Join with code</p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        placeholder="ABC123"
        className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 uppercase"
      />
      <button type="submit" className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-lime">
        Join room
      </button>
    </form>
  );
}
