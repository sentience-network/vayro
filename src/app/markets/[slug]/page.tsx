import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getCurrentUser } from "@/lib/auth";
import { getMarketBySlug, parseOptions, tallyChoices } from "@/lib/markets";
import { formatCents } from "@/lib/revenue";
import { JoinPanel } from "@/components/JoinPanel";
import { ResolvePanel } from "@/components/ResolvePanel";
import { ShareButtons } from "@/components/ShareButtons";
import Link from "next/link";

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [user, market] = await Promise.all([getCurrentUser(), getMarketBySlug(slug)]);
  if (!market) notFound();

  const options = parseOptions(market.optionsJson);
  const tallies = tallyChoices(market.entries, options);
  const total = market.entries.length || 1;
  const myEntry = user ? market.entries.find((e) => e.userId === user.id) : null;
  const isCreator = user?.id === market.creatorId;

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
      <Link href="/markets" className="text-sm font-semibold text-tide">
        ← All markets
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.35fr_0.9fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
            <span>{market.category}</span>
            <span className="h-1 w-1 rounded-full bg-ink/30" />
            <span className={market.status === "OPEN" ? "text-tide" : "text-ink/40"}>
              {market.status === "OPEN" ? "Open" : "Resolved"}
            </span>
          </div>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-ink md:text-5xl">
            {market.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/65">
            {market.description}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-[var(--line)] py-6 sm:grid-cols-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink/40">Entry</p>
              <p className="mt-1 font-display text-2xl font-bold">{market.entryFee} cr</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink/40">Players</p>
              <p className="mt-1 font-display text-2xl font-bold">{market.participantCount}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink/40">Ad pool</p>
              <p className="mt-1 font-display text-2xl font-bold text-tide">
                {formatCents(market.adPoolCents)}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink/40">Resolves</p>
              <p className="mt-1 font-display text-lg font-bold">
                {format(market.resolvesAt, "MMM d, h:mm a")}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-2xl font-bold text-ink">Crowd split</h2>
            <div className="mt-4 space-y-3">
              {options.map((option) => {
                const count = tallies[option] || 0;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={option}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-semibold text-ink">
                        {option}
                        {market.resolvedOption === option ? " · winner" : ""}
                      </span>
                      <span className="text-ink/50">
                        {count} · {market.entries.length ? pct : 0}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-mist">
                      <div
                        className="h-full rounded-full bg-tide transition-all"
                        style={{ width: `${market.entries.length ? pct : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {market.payouts.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-bold text-ink">Revenue distribution</h2>
              <ul className="mt-4 space-y-2">
                {market.payouts.map((payout) => (
                  <li
                    key={payout.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] py-2 text-sm"
                  >
                    <span className="text-ink/70">
                      <span className="font-semibold text-ink">{payout.role}</span>
                      {payout.user ? ` · ${payout.user.displayName}` : " · Betme"}
                    </span>
                    <span className="font-semibold text-tide">
                      {formatCents(payout.amountCents)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-display text-2xl font-bold text-ink">Participants</h2>
            <ul className="mt-4 space-y-2">
              {market.entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex justify-between border-b border-[var(--line)] py-2 text-sm"
                >
                  <span>
                    {entry.user.displayName}{" "}
                    <span className="text-ink/40">@{entry.user.username}</span>
                  </span>
                  <span className="font-semibold">
                    {entry.choice}
                    {entry.isCorrect === true ? " ✓" : entry.isCorrect === false ? " ✗" : ""}
                  </span>
                </li>
              ))}
              {market.entries.length === 0 && (
                <li className="text-sm text-ink/50">No entries yet — be first.</li>
              )}
            </ul>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-[var(--line)] bg-white/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">
              Posted by
            </p>
            <Link
              href={`/u/${market.creator.username}`}
              className="mt-2 block font-display text-2xl font-bold text-ink hover:text-tide"
            >
              {market.creator.displayName}
            </Link>
            <p className="text-sm text-ink/55">
              @{market.creator.username} ·{" "}
              {Math.round(market.creator.accuracyScore * 100)}% accuracy
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">
              Share this call
            </p>
            <p className="mt-2 text-sm text-ink/60">
              {market.shareCount} shares · boost the creator&apos;s board rank
            </p>
            <div className="mt-3">
              <ShareButtons slug={market.slug} title={market.title} path={`/markets/${market.slug}`} />
            </div>
          </div>

          {market.status === "OPEN" && user && (
            <JoinPanel
              marketId={market.id}
              slug={market.slug}
              options={options}
              entryFee={market.entryFee}
              credits={user.credits}
              alreadyJoined={Boolean(myEntry)}
            />
          )}

          {market.status === "OPEN" && !user && (
            <div className="rounded-2xl border border-[var(--line)] bg-mist/50 p-6">
              <p className="font-display text-2xl font-bold text-ink">Sign in to play</p>
              <p className="mt-2 text-sm text-ink/60">
                Earn free signup credits, watch an ad, and join for a flat fee.
              </p>
              <Link
                href="/signup"
                className="mt-4 inline-block rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-lime"
              >
                Earn credits
              </Link>
            </div>
          )}

          {market.status === "OPEN" && isCreator && (
            <ResolvePanel slug={market.slug} options={options} />
          )}

          {myEntry && (
            <div className="rounded-2xl bg-ink p-5 text-foam">
              <p className="text-xs uppercase tracking-[0.14em] text-lime/80">Your call</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-lime">{myEntry.choice}</p>
              <p className="mt-2 text-sm text-foam/65">
                Activity weight: {myEntry.activityScore}. Watch more ads to raise your share.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
