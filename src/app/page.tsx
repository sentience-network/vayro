import Link from "next/link";
import { ShareWaterfall } from "@/components/ShareWaterfall";
import { getOpenMarkets } from "@/lib/markets";
import { MarketCard } from "@/components/MarketCard";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const [user, markets] = await Promise.all([getCurrentUser(), getOpenMarkets()]);
  const featured = markets.slice(0, 3);

  return (
    <div>
      <section className="relative min-h-[88vh] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(7,26,20,0.88) 0%, rgba(18,53,43,0.72) 42%, rgba(31,122,99,0.45) 100%), url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221600%22 height=%22900%22 viewBox=%220 0 1600 900%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22%3E%3Cstop stop-color=%22%23123a30%22/%3E%3Cstop offset=%221%22 stop-color=%22%230b1f1a%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%221600%22 height=%22900%22 fill=%22url(%23g)%22/%3E%3Cg fill=%22none%22 stroke=%22%23c8f560%22 stroke-opacity=%220.18%22 stroke-width=%222%22%3E%3Cpath d=%22M0 620 C280 480 420 780 760 560 S1200 320 1600 480%22/%3E%3Cpath d=%22M0 700 C320 560 480 820 820 640 S1240 420 1600 580%22/%3E%3C/g%3E%3Ccircle cx=%221220%22 cy=%22220%22 r=%22180%22 fill=%22%23c8f560%22 fill-opacity=%220.08%22/%3E%3Ccircle cx=%22340%22 cy=%22180%22 r=%22120%22 fill=%22%23ffffff%22 fill-opacity=%220.04%22/%3E%3C/svg%3E') center/cover",
          }}
        />
        <div className="animate-pulse-soft absolute -right-16 top-24 h-64 w-64 rounded-full bg-lime/20 blur-3xl" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-24 md:px-8 md:pb-20">
          <p className="animate-rise font-display text-5xl font-extrabold tracking-tight text-lime sm:text-6xl md:text-7xl lg:text-8xl">
            BETME
          </p>
          <h1 className="animate-rise-delay mt-4 max-w-3xl font-display text-3xl font-bold leading-[1.05] text-foam sm:text-4xl md:text-5xl">
            Post predictions. Attract the crowd. Share the ad money.
          </h1>
          <p className="animate-rise-delay-2 mt-5 max-w-xl text-base leading-relaxed text-foam/75 md:text-lg">
            A legal social prediction market powered by earned Betme credits — not purchases.
            Watch a partner ad to play; revenue flows to Betme, creators, accurate predictors,
            then everyone in.
          </p>
          <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href={user ? "/markets" : "/signup"}
              className="rounded-md bg-lime px-5 py-3 text-sm font-bold text-ink transition hover:brightness-95"
            >
              {user ? "Browse markets" : "Earn 100 signup credits"}
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-md border border-foam/25 bg-white/5 px-5 py-3 text-sm font-semibold text-foam backdrop-blur transition hover:bg-white/10"
            >
              See the revenue waterfall
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">
            One job: earn to play
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-4xl">
            Credits are earned through the platform — they can never be bought.
          </h2>
          <p className="mt-4 text-ink/65">
            Signup bonuses, daily check-ins, partner ad rewards, and posting markets that attract
            participants. Flat credit fees unlock predictions; ad dollars create the payout pool.
          </p>
        </div>

        <div className="mt-10 grid gap-8 border-t border-[var(--line)] pt-10 md:grid-cols-3">
          {[
            {
              title: "Post",
              copy: "Create a social prediction. Attract viewers who watch ads to enter — and earn creator share.",
            },
            {
              title: "Watch",
              copy: "Every entry starts with a partner ad. That view funds the market pool and pays you credits.",
            },
            {
              title: "Share",
              copy: "When a market resolves, ad revenue cascades: Betme → creator → accurate predictors → participants.",
            },
          ].map((item) => (
            <div key={item.title}>
              <p className="font-display text-2xl font-bold text-tide">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white/35">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">
                Ad revenue waterfall
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-4xl">
                Biggest share to Betme, then creators, then accuracy.
              </h2>
              <p className="mt-4 text-ink/65">
                Built as entertainment + creator economy — not a cash book. No credit store. No
                leveraged betting license required to launch this model.
              </p>
            </div>
            <ShareWaterfall />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">Social layer</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-4xl">
            Badges, follows, leaderboards, chat, and video.
          </h2>
          <p className="mt-4 text-ink/65">
            Track accurate predictors and top creators, follow the people you trust, share calls to
            other socials, and debate live — while credits stay earn-only and non-cashable.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/social" className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-lime">
              Enter social
            </Link>
            <Link href="/leaderboards" className="rounded-md border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm font-semibold">
              View boards
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">Live now</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink">Popular predictions</h2>
          </div>
          <Link href="/markets" className="text-sm font-semibold text-tide">
            View all
          </Link>
        </div>
        <div>
          {featured.map((market) => (
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
          {featured.length === 0 && (
            <p className="py-10 text-ink/55">No markets yet — be the first to post.</p>
          )}
        </div>
      </section>
    </div>
  );
}
