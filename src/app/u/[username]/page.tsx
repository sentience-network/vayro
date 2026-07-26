import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getProfileByUsername } from "@/lib/social";
import { prisma } from "@/lib/db";
import { Avatar } from "@/components/Avatar";
import { BadgePill } from "@/components/BadgePill";
import { FollowButton } from "@/components/FollowButton";
import { ShareButtons } from "@/components/ShareButtons";
import { ProfileEditor } from "@/components/ProfileEditor";
import { MarketCard } from "@/components/MarketCard";
import { CREDIT_POLICY } from "@/lib/credits";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [viewer, profile] = await Promise.all([
    getCurrentUser(),
    getProfileByUsername(username),
  ]);
  if (!profile) notFound();

  const isSelf = viewer?.id === profile.id;
  const isFollowing = viewer
    ? Boolean(
        await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewer.id,
              followingId: profile.id,
            },
          },
        })
      )
    : false;

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex flex-wrap items-start gap-4">
            <Avatar name={profile.displayName} hue={profile.avatarHue} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-4xl font-extrabold text-ink">
                {profile.displayName}
              </h1>
              <p className="text-ink/50">@{profile.username}</p>
              <p className="mt-3 max-w-xl text-ink/70">{profile.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {!isSelf && viewer && (
                  <>
                    <FollowButton username={profile.username} initialFollowing={isFollowing} />
                    <Link
                      href={`/messages?to=${profile.username}`}
                      className="rounded-md border border-[var(--line)] bg-white/70 px-4 py-2 text-sm font-semibold"
                    >
                      Message
                    </Link>
                  </>
                )}
                {isSelf && (
                  <Link
                    href="/dashboard"
                    className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-lime"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Accuracy", `${Math.round(profile.accuracyScore * 100)}%`],
              ["Calls", `${profile.totalPredictions}`],
              ["Creator pts", `${profile.creatorScore}`],
              ["Credits", `${profile.credits}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[var(--line)] bg-white/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-ink/40">{label}</p>
                <p className="mt-1 font-display text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink/55">
            <span>{profile._count.followers} followers</span>
            <span>{profile._count.following} following</span>
            <span>{profile._count.referrals} referrals</span>
          </div>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold text-ink">Badges</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {profile.badges.map((ub) => (
                <BadgePill
                  key={ub.id}
                  icon={ub.badge.icon}
                  name={ub.badge.name}
                  description={ub.badge.description}
                  tier={ub.badge.tier}
                />
              ))}
              {profile.badges.length === 0 && (
                <p className="text-sm text-ink/50">No badges yet — keep calling and creating.</p>
              )}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold text-ink">Markets posted</h2>
            <div className="mt-3 border-t border-[var(--line)]">
              {profile.markets.map((market) => (
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
                  creatorName={profile.displayName}
                />
              ))}
              {profile.markets.length === 0 && (
                <p className="py-6 text-sm text-ink/50">No markets posted yet.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-[var(--line)] bg-white/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">Share</p>
            <p className="mt-2 font-display text-xl font-bold text-ink">Boost this profile</p>
            <div className="mt-4">
              <ShareButtons
                title={`${profile.displayName} on Betme`}
                path={`/u/${profile.username}`}
              />
            </div>
          </div>

          {isSelf && (
            <>
              <div className="rounded-2xl bg-ink p-5 text-foam">
                <p className="text-xs uppercase tracking-[0.14em] text-lime/80">Your referral code</p>
                <p className="mt-2 font-display text-3xl font-extrabold text-lime">
                  {profile.referralCode}
                </p>
                <p className="mt-2 text-sm text-foam/65">
                  Bring friends — you both earn credits. Credits never exchange for cash.
                </p>
              </div>
              <ProfileEditor
                username={profile.username}
                displayName={profile.displayName}
                bio={profile.bio}
                avatarHue={profile.avatarHue}
              />
            </>
          )}

          <p className="text-xs leading-relaxed text-ink/45">{CREDIT_POLICY}</p>
        </aside>
      </div>
    </div>
  );
}
