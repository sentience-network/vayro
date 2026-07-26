import Link from "next/link";
import { getLeaderboards } from "@/lib/social";
import { Avatar } from "@/components/Avatar";
import { MarketCard } from "@/components/MarketCard";

export default async function LeaderboardsPage() {
  const { accurate, creators, popular } = await getLeaderboards();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">Tracking</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold text-ink md:text-5xl">
        Leaderboards
      </h1>
      <p className="mt-3 max-w-2xl text-ink/65">
        Track accurate predictors, top-performing creators, and the predictions pulling the biggest
        crowds right now.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink">Popular predictions</h2>
        <div className="mt-4 border-t border-[var(--line)]">
          {popular.map((market) => (
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
        </div>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section className="rounded-3xl border border-[var(--line)] bg-white/45 p-6">
          <h2 className="font-display text-2xl font-bold text-ink">Most accurate</h2>
          <ul className="mt-5 space-y-3">
            {accurate.map((person, i) => (
              <li key={person.id} className="flex items-center justify-between gap-3">
                <Link href={`/u/${person.username}`} className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-tide">{i + 1}</span>
                  <Avatar name={person.displayName} hue={person.avatarHue} />
                  <div>
                    <p className="font-semibold">{person.displayName}</p>
                    <p className="text-xs text-ink/45">
                      {person.correctPredictions}/{person.totalPredictions} correct
                    </p>
                  </div>
                </Link>
                <span className="font-bold text-tide">
                  {Math.round(person.accuracyScore * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-[var(--line)] bg-white/45 p-6">
          <h2 className="font-display text-2xl font-bold text-ink">Top creators</h2>
          <ul className="mt-5 space-y-3">
            {creators.map((person, i) => (
              <li key={person.id} className="flex items-center justify-between gap-3">
                <Link href={`/u/${person.username}`} className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-tide">{i + 1}</span>
                  <Avatar name={person.displayName} hue={person.avatarHue} />
                  <div>
                    <p className="font-semibold">{person.displayName}</p>
                    <p className="text-xs text-ink/45">
                      {person._count.markets} posts · {person._count.followers} followers
                    </p>
                  </div>
                </Link>
                <span className="font-bold">{person.creatorScore}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
