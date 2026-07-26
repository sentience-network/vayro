"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileEditor({
  username,
  displayName,
  bio,
  avatarHue,
}: {
  username: string;
  displayName: string;
  bio: string;
  avatarHue: number;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/profile/${username}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: String(form.get("displayName") || ""),
          bio: String(form.get("bio") || ""),
          avatarHue: Number(form.get("avatarHue") || avatarHue),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMessage("Profile updated");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/50 p-5">
      <p className="font-display text-xl font-bold text-ink">Edit profile</p>
      <input
        name="displayName"
        defaultValue={displayName}
        className="w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5 text-sm"
      />
      <textarea
        name="bio"
        defaultValue={bio}
        rows={3}
        className="w-full rounded-md border border-[var(--line)] bg-white/80 px-3 py-2.5 text-sm"
      />
      <label className="block text-sm text-ink/60">
        Avatar hue
        <input
          name="avatarHue"
          type="range"
          min={0}
          max={359}
          defaultValue={avatarHue}
          className="mt-2 w-full"
        />
      </label>
      {message && <p className="text-sm text-ink/60">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-lime disabled:opacity-50"
      >
        Save
      </button>
    </form>
  );
}
