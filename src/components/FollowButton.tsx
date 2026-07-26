"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FollowButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/follow/${username}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Follow failed");
      setFollowing(data.following);
      router.refresh();
    } catch {
      // keep prior state
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={toggle}
      className={`rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
        following
          ? "border border-[var(--line)] bg-white/70 text-ink"
          : "bg-ink text-lime"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
