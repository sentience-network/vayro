import { prisma } from "./db";
import { CREDIT_REWARDS } from "./constants";

export async function grantCredits(
  userId: string,
  amount: number,
  reason: string,
  meta?: Record<string, unknown>
) {
  if (amount === 0) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    }),
    prisma.creditLedger.create({
      data: {
        userId,
        amount,
        reason,
        metaJson: meta ? JSON.stringify(meta) : null,
      },
    }),
  ]);
}

export async function spendCredits(
  userId: string,
  amount: number,
  reason: string,
  meta?: Record<string, unknown>
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.credits < amount) {
    throw new Error("Not enough Betme credits");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: amount } },
    }),
    prisma.creditLedger.create({
      data: {
        userId,
        amount: -amount,
        reason,
        metaJson: meta ? JSON.stringify(meta) : null,
      },
    }),
  ]);
}

export async function claimDailyBonus(userId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const existing = await prisma.creditLedger.findFirst({
    where: {
      userId,
      reason: "daily_bonus",
      createdAt: { gte: start },
    },
  });

  if (existing) {
    return { granted: false, amount: 0, message: "Daily bonus already claimed" };
  }

  await grantCredits(userId, CREDIT_REWARDS.daily, "daily_bonus");
  return {
    granted: true,
    amount: CREDIT_REWARDS.daily,
    message: `+${CREDIT_REWARDS.daily} Betme credits for checking in`,
  };
}

export async function grantSignupBonus(userId: string) {
  await grantCredits(userId, CREDIT_REWARDS.signup, "signup_bonus");
}
