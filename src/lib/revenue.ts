import { prisma } from "./db";
import { REVENUE_SHARES } from "./constants";

function allocate(totalCents: number, weight: number, totalWeight: number) {
  if (totalWeight <= 0) return 0;
  return Math.floor((totalCents * weight) / totalWeight);
}

/**
 * Ad revenue waterfall:
 * 1. Betme platform (largest)
 * 2. Prediction creator
 * 3. Accurate predictors (weighted by activity)
 * 4. All participants (base share)
 */
export async function distributeMarketRevenue(marketId: string) {
  const market = await prisma.market.findUnique({
    where: { id: marketId },
    include: { entries: true },
  });

  if (!market || market.status !== "RESOLVED" || !market.resolvedOption) {
    throw new Error("Market must be resolved before payout");
  }

  const existing = await prisma.revenuePayout.count({ where: { marketId } });
  if (existing > 0) {
    throw new Error("Revenue already distributed for this market");
  }

  const pool = market.adPoolCents;
  if (pool <= 0) {
    return { pool: 0, payouts: [] };
  }

  const betmeCents = Math.floor(pool * REVENUE_SHARES.betme);
  const creatorCents = Math.floor(pool * REVENUE_SHARES.creator);
  const accuratePool = Math.floor(pool * REVENUE_SHARES.accurate);
  const participantPool = Math.floor(pool * REVENUE_SHARES.participants);

  const payouts: {
    role: string;
    userId: string | null;
    amountCents: number;
    shareBps: number;
    note?: string;
  }[] = [
    {
      role: "PLATFORM",
      userId: null,
      amountCents: betmeCents,
      shareBps: Math.round(REVENUE_SHARES.betme * 10000),
      note: "Betme platform share",
    },
    {
      role: "CREATOR",
      userId: market.creatorId,
      amountCents: creatorCents,
      shareBps: Math.round(REVENUE_SHARES.creator * 10000),
      note: "Prediction creator share",
    },
  ];

  const correct = market.entries.filter((e) => e.choice === market.resolvedOption);
  const accurateWeight = correct.reduce((sum, e) => sum + Math.max(1, e.activityScore), 0);

  for (const entry of correct) {
    const amount = allocate(accuratePool, Math.max(1, entry.activityScore), accurateWeight);
    if (amount <= 0) continue;
    payouts.push({
      role: "ACCURATE",
      userId: entry.userId,
      amountCents: amount,
      shareBps: Math.round(REVENUE_SHARES.accurate * 10000),
      note: "Accurate predictor share",
    });
  }

  const allWeight = market.entries.reduce((sum, e) => sum + Math.max(1, e.activityScore), 0);
  for (const entry of market.entries) {
    const amount = allocate(participantPool, Math.max(1, entry.activityScore), allWeight);
    if (amount <= 0) continue;
    payouts.push({
      role: "PARTICIPANT",
      userId: entry.userId,
      amountCents: amount,
      shareBps: Math.round(REVENUE_SHARES.participants * 10000),
      note: "Participant ad share",
    });
  }

  await prisma.revenuePayout.createMany({
    data: payouts.map((p) => ({
      marketId,
      role: p.role,
      userId: p.userId,
      amountCents: p.amountCents,
      shareBps: p.shareBps,
      note: p.note,
    })),
  });

  return { pool, payouts };
}

export function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
