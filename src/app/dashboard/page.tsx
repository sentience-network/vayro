import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DailyBonusButton } from "@/components/DailyBonusButton";
import { EarnCreditsPanel } from "@/components/EarnCreditsPanel";
import { formatCents } from "@/lib/revenue";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [ledger, entries, created, payouts] = await Promise.all([
    prisma.creditLedger.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.marketEntry.findMany({
      where: { userId: user.id },
      include: { market: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.market.findMany({
      where: { creatorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.revenuePayout.findMany({
      where: { userId: user.id },
      include: { market: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const earnedCents = payouts.reduce((sum, p) => sum + p.amountCents, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">
            Dashboard
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-ink md:text-5xl">
            Hey, {user.displayName}
          </h1>
          <p className="mt-3 text-ink/65">
            Credits power entries. Ad revenue shares reward creators and accurate, active players.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/social" className="rounded-md border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm font-semibold">
            Social
          </Link>
          <Link href={`/u/${user.username}`} className="rounded-md border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm font-semibold">
            Profile
          </Link>
          <Link href="/create" className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-lime">
            Post prediction
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-ink p-5 text-foam md:flex md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-lime/80">Referral code</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-lime">{user.referralCode}</p>
          <p className="mt-1 text-sm text-foam/65">
            Bring users → both earn credits. Credits wager on markets only — never cash.
          </p>
        </div>
        <Link href={`/signup?ref=${user.referralCode}`} className="mt-4 inline-block text-sm font-semibold text-lime md:mt-0">
          Share signup link →
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Betme credits", value: `${user.credits}` },
          {
            label: "Accuracy",
            value: `${Math.round(user.accuracyScore * 100)}%`,
          },
          { label: "Creator score", value: `${user.creatorScore}` },
          { label: "Ad share earned", value: formatCents(earnedCents) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[var(--line)] bg-white/50 p-5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink/40">{stat.label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--line)] bg-white/50 p-6">
          <p className="font-display text-2xl font-bold text-ink">Daily check-in</p>
          <p className="mt-2 text-sm text-ink/60">
            Come back to earn credits. No purchases — usage is the only path in.
          </p>
          <div className="mt-4">
            <DailyBonusButton />
          </div>
        </div>
        <EarnCreditsPanel />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-bold text-ink">Credit activity</h2>
          <ul className="mt-4 space-y-2">
            {ledger.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between border-b border-[var(--line)] py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-ink">{row.reason.replaceAll("_", " ")}</p>
                  <p className="text-ink/45">
                    {formatDistanceToNow(row.createdAt, { addSuffix: true })}
                  </p>
                </div>
                <span className={row.amount >= 0 ? "font-bold text-tide" : "font-bold text-ember"}>
                  {row.amount >= 0 ? "+" : ""}
                  {row.amount}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-ink">Your entries</h2>
          <ul className="mt-4 space-y-2">
            {entries.map((entry) => (
              <li key={entry.id} className="border-b border-[var(--line)] py-2 text-sm">
                <Link href={`/markets/${entry.market.slug}`} className="font-semibold text-ink hover:text-tide">
                  {entry.market.title}
                </Link>
                <p className="text-ink/55">
                  Picked {entry.choice} · {entry.feePaid} cr · activity {entry.activityScore}
                </p>
              </li>
            ))}
            {entries.length === 0 && <li className="text-sm text-ink/50">No entries yet.</li>}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-ink">Markets you posted</h2>
          <ul className="mt-4 space-y-2">
            {created.map((market) => (
              <li key={market.id} className="border-b border-[var(--line)] py-2 text-sm">
                <Link href={`/markets/${market.slug}`} className="font-semibold text-ink hover:text-tide">
                  {market.title}
                </Link>
                <p className="text-ink/55">
                  {market.status} · pool {formatCents(market.adPoolCents)} ·{" "}
                  {market.participantCount} players
                </p>
              </li>
            ))}
            {created.length === 0 && (
              <li className="text-sm text-ink/50">
                None yet.{" "}
                <Link href="/create" className="font-semibold text-tide">
                  Post one
                </Link>
              </li>
            )}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-ink">Ad revenue shares</h2>
          <ul className="mt-4 space-y-2">
            {payouts.map((payout) => (
              <li
                key={payout.id}
                className="flex justify-between border-b border-[var(--line)] py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-ink">{payout.role}</p>
                  <p className="text-ink/45">{payout.market.title}</p>
                </div>
                <span className="font-bold text-tide">{formatCents(payout.amountCents)}</span>
              </li>
            ))}
            {payouts.length === 0 && (
              <li className="text-sm text-ink/50">Shares appear after markets resolve.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
