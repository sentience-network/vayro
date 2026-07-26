import { MarketCard } from "@/components/MarketCard";
import { getOpenMarkets } from "@/lib/markets";
import Link from "next/link";

export default async function MarketsPage() {
  const markets = await getOpenMarkets();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">Markets</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-ink md:text-5xl">
            Social predictions
          </h1>
          <p className="mt-3 max-w-xl text-ink/65">
            Flat credit entry. Ad-funded revenue share. Watch a partner spot to participate.
          </p>
        </div>
        <Link
          href="/create"
          className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-lime"
        >
          Post a prediction
        </Link>
      </div>

      <div className="mt-10 border-t border-[var(--line)]">
        {markets.map((market) => (
          <MarketCard
            key={market.id}
            slug={market.slug}
            title={market.title}
            category={market.category}
            status={market.status}
            entryFee={market.entryFee}
            participantCount={market.participantCount}
            adPoolCents={market.adPoolCents}
            resolvesAt={market.resolvesAt}
            creatorName={market.creator.displayName}
          />
        ))}
        {markets.length === 0 && (
          <p className="py-12 text-ink/55">No markets yet. Create the first one.</p>
        )}
      </div>
    </div>
  );
}
