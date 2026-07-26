import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { formatCents } from "@/lib/revenue";

type MarketCardProps = {
  slug: string;
  title: string;
  category: string;
  status: string;
  entryFee: number;
  participantCount: number;
  adPoolCents: number;
  resolvesAt: Date | string;
  creatorName: string;
};

export function MarketCard({
  slug,
  title,
  category,
  status,
  entryFee,
  participantCount,
  adPoolCents,
  resolvesAt,
  creatorName,
}: MarketCardProps) {
  const open = status === "OPEN";

  return (
    <Link
      href={`/markets/${slug}`}
      className="group block border-b border-[var(--line)] py-6 transition hover:bg-white/40"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
            <span>{category}</span>
            <span className="h-1 w-1 rounded-full bg-ink/30" />
            <span className={open ? "text-tide" : "text-ink/40"}>
              {open ? "Open" : "Resolved"}
            </span>
          </div>
          <h3 className="font-display text-2xl font-bold leading-tight text-ink transition group-hover:text-tide md:text-[1.7rem]">
            {title}
          </h3>
          <p className="mt-2 text-sm text-ink/55">
            Posted by {creatorName} · resolves{" "}
            {formatDistanceToNow(new Date(resolvesAt), { addSuffix: true })}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-right text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink/40">Entry</p>
            <p className="mt-1 font-semibold text-ink">{entryFee} cr</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink/40">Players</p>
            <p className="mt-1 font-semibold text-ink">{participantCount}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink/40">Ad pool</p>
            <p className="mt-1 font-semibold text-tide">{formatCents(adPoolCents)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
