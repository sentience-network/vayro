import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getFollowingFeed, getLeaderboards } from "@/lib/social";
import { MarketCard } from "@/components/MarketCard";
import { Avatar } from "@/components/Avatar";
import { CreateVideoButton } from "@/components/VideoChat";
import { redirect } from "next/navigation";

export default async function SocialPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [{ accurate, creators, popular }, feed] = await Promise.all([
    getLeaderboards(),
    getFollowingFeed(user.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">Social</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-ink md:text-5xl">
            Your Betme circle
          </h1>
          <p className="mt-3 max-w-2xl text-ink/65">
            Follow sharp predictors, ride popular markets, message friends, and hop into video —
            all powered by earned credits that never cash out.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/messages" className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-lime">
            Messages
          </Link>
          <CreateVideoButton />
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-ink">Popular right now</h2>
          <Link href="/leaderboards" className="text-sm font-semibold text-tide">
            Full boards
          </Link>
        </div>
        <div className="border-t border-[var(--line)]">
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
        <section>
          <h2 className="font-display text-2xl font-bold text-ink">Accurate predictors</h2>
          <ul className="mt-4 space-y-3">
            {accurate.map((person, index) => (
              <li key={person.id} className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-3">
                <Link href={`/u/${person.username}`} className="flex items-center gap-3">
                  <span className="w-5 font-display text-lg font-bold text-tide">{index + 1}</span>
                  <Avatar name={person.displayName} hue={person.avatarHue} />
                  <div>
                    <p className="font-semibold text-ink">{person.displayName}</p>
                    <p className="text-xs text-ink/45">@{person.username}</p>
                  </div>
                </Link>
                <p className="text-sm font-bold text-tide">
                  {Math.round(person.accuracyScore * 100)}%
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-ink">Top creators</h2>
          <ul className="mt-4 space-y-3">
            {creators.map((person, index) => (
              <li key={person.id} className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-3">
                <Link href={`/u/${person.username}`} className="flex items-center gap-3">
                  <span className="w-5 font-display text-lg font-bold text-tide">{index + 1}</span>
                  <Avatar name={person.displayName} hue={person.avatarHue} />
                  <div>
                    <p className="font-semibold text-ink">{person.displayName}</p>
                    <p className="text-xs text-ink/45">
                      {person._count.markets} markets · {person._count.followers} followers
                    </p>
                  </div>
                </Link>
                <p className="text-sm font-bold text-ink">{person.creatorScore} pts</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink">Following feed</h2>
        <p className="mt-2 text-sm text-ink/55">
          Predictions from people you follow. Earn credits by staying active — never by buying in.
        </p>
        <div className="mt-4 border-t border-[var(--line)]">
          {feed.map((market) => (
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
          {feed.length === 0 && (
            <p className="py-8 text-sm text-ink/50">
              Follow creators from{" "}
              <Link href="/leaderboards" className="font-semibold text-tide">
                leaderboards
              </Link>{" "}
              to fill this feed.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
