"use client";

import { useState } from "react";

export function ShareButtons({
  slug,
  title,
  path,
}: {
  slug?: string;
  title: string;
  path: string;
}) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://betme.app";
  const url = `${origin}${path}`;
  const text = `${title} — call it on Betme`;

  async function trackShare() {
    if (!slug) return;
    await fetch(`/api/share/${slug}`, { method: "POST" });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    await trackShare();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function nativeShare() {
    if (navigator.share) {
      await navigator.share({ title: "Betme", text, url });
      await trackShare();
      return;
    }
    await copyLink();
  }

  const encoded = encodeURIComponent(`${text} ${url}`);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={nativeShare}
        className="rounded-md bg-ink px-3 py-2 text-xs font-semibold text-lime"
      >
        Share
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="rounded-md border border-[var(--line)] bg-white/70 px-3 py-2 text-xs font-semibold text-ink"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${encoded}`}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackShare()}
        className="rounded-md border border-[var(--line)] bg-white/70 px-3 py-2 text-xs font-semibold text-ink"
      >
        X / Twitter
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackShare()}
        className="rounded-md border border-[var(--line)] bg-white/70 px-3 py-2 text-xs font-semibold text-ink"
      >
        Facebook
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackShare()}
        className="rounded-md border border-[var(--line)] bg-white/70 px-3 py-2 text-xs font-semibold text-ink"
      >
        LinkedIn
      </a>
    </div>
  );
}
