"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-md px-2.5 py-1.5 text-ink/60 transition hover:bg-mist hover:text-ink"
    >
      Out
    </button>
  );
}
