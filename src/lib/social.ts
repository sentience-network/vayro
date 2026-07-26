import { prisma } from "./db";

export function referralCodeFromUsername(username: string) {
  const base = username.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || "BETME"}${suffix}`;
}

export async function getProfileByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      badges: {
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
      },
      markets: {
        orderBy: { participantCount: "desc" },
        take: 6,
      },
      entries: {
        include: { market: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
      _count: {
        select: {
          followers: true,
          following: true,
          markets: true,
          entries: true,
          referrals: true,
        },
      },
    },
  });
}

export async function getLeaderboards() {
  const [accurate, creators, popular] = await Promise.all([
    prisma.user.findMany({
      where: { totalPredictions: { gte: 3 } },
      orderBy: [{ accuracyScore: "desc" }, { correctPredictions: "desc" }],
      take: 10,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarHue: true,
        accuracyScore: true,
        correctPredictions: true,
        totalPredictions: true,
      },
    }),
    prisma.user.findMany({
      where: { creatorScore: { gt: 0 } },
      orderBy: [{ creatorScore: "desc" }, { accuracyScore: "desc" }],
      take: 10,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarHue: true,
        creatorScore: true,
        _count: { select: { markets: true, followers: true } },
      },
    }),
    prisma.market.findMany({
      where: { status: "OPEN" },
      orderBy: [{ participantCount: "desc" }, { shareCount: "desc" }, { adPoolCents: "desc" }],
      take: 8,
      include: {
        creator: {
          select: { username: true, displayName: true, avatarHue: true },
        },
      },
    }),
  ]);

  return { accurate, creators, popular };
}

export async function getFollowingFeed(userId: string) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const ids = follows.map((f) => f.followingId);
  if (ids.length === 0) return [];

  return prisma.market.findMany({
    where: { creatorId: { in: ids } },
    include: {
      creator: {
        select: { username: true, displayName: true, avatarHue: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export function avatarStyle(hue: number) {
  return {
    background: `linear-gradient(145deg, hsl(${hue} 45% 28%), hsl(${(hue + 40) % 360} 55% 42%))`,
  } as const;
}
