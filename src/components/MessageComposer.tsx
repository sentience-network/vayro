"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function StartMessageForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: String(form.get("username") || ""),
          body: String(form.get("body") || ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not message");
      router.push(`/messages/${data.conversationId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/50 p-5">
      <p className="font-display text-xl font-bold text-ink">Message someone</p>
      <input
        name="username"
        required
        placeholder="username"
        className="w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5 text-sm"
      />
      <textarea
        name="body"
        rows={3}
        placeholder="Say hello, share a call, start a debate…"
        className="w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5 text-sm"
      />
      {error && <p className="text-sm text-ember">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-lime disabled:opacity-50"
      >
        {loading ? "Opening…" : "Start chat"}
      </button>
    </form>
  );
}

export function ChatBox({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Send failed");
      }
      setBody("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={send} className="flex gap-2 border-t border-[var(--line)] pt-4">
      <input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a message…"
        className="flex-1 rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5 text-sm"
      />
      <button
        type="submit"
        disabled={loading || !body.trim()}
        className="rounded-md bg-lime px-4 py-2.5 text-sm font-bold text-ink disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
