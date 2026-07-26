import { prisma } from "./db";
import { BADGE_CATALOG } from "./constants";

export async function ensureBadgeCatalog() {
  for (const badge of BADGE_CATALOG) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        tier: badge.tier,
      },
      create: { ...badge },
    });
  }
}

export async function awardBadge(userId: string, key: string) {
  const badge = await prisma.badge.findUnique({ where: { key } });
  if (!badge) return null;

  try {
    return await prisma.userBadge.create({
      data: { userId, badgeId: badge.id },
      include: { badge: true },
    });
  } catch {
    return null; // already owned
  }
}

export async function evaluateUserBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      entries: true,
      markets: { include: { _count: { select: { entries: true } } } },
      referrals: true,
      following: true,
      videoParticipations: true,
    },
  });
  if (!user) return [];

  const earned = [];

  earned.push(await awardBadge(userId, "welcome_caller"));

  if (user.entries.length >= 1) {
    earned.push(await awardBadge(userId, "first_call"));
  }

  const resolvedCorrect = user.entries.filter((e) => e.isCorrect !== null);
  if (resolvedCorrect.length >= 5 && user.accuracyScore >= 0.6) {
    earned.push(await awardBadge(userId, "sharp_eye"));
  }
  if (resolvedCorrect.length >= 8 && user.accuracyScore >= 0.75) {
    earned.push(await awardBadge(userId, "oracle"));
  }

  if (user.markets.some((m) => m._count.entries >= 3)) {
    earned.push(await awardBadge(userId, "crowd_magnet"));
  }

  if (user.referrals.length >= 1) {
    earned.push(await awardBadge(userId, "signal_booster"));
  }

  if (user.following.length >= 1) {
    earned.push(await awardBadge(userId, "social_spark"));
  }

  if (user.videoParticipations.length >= 1) {
    earned.push(await awardBadge(userId, "live_wire"));
  }

  return earned.filter(Boolean);
}
