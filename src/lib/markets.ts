import { prisma } from "./db";

export function parseOptions(optionsJson: string): string[] {
  try {
    const parsed = JSON.parse(optionsJson);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "market"}-${suffix}`;
}

export async function getOpenMarkets() {
  return prisma.market.findMany({
    where: { status: { in: ["OPEN", "RESOLVED"] } },
    include: {
      creator: {
        select: { id: true, username: true, displayName: true },
      },
      _count: { select: { entries: true } },
    },
    orderBy: [{ status: "asc" }, { participantCount: "desc" }, { createdAt: "desc" }],
  });
}

export async function getMarketBySlug(slug: string) {
  return prisma.market.findUnique({
    where: { slug },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          displayName: true,
          accuracyScore: true,
        },
      },
      entries: {
        include: {
          user: {
            select: { id: true, username: true, displayName: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      payouts: {
        include: {
          user: {
            select: { id: true, username: true, displayName: true },
          },
        },
      },
    },
  });
}

export function tallyChoices(entries: { choice: string }[], options: string[]) {
  const counts = Object.fromEntries(options.map((o) => [o, 0])) as Record<string, number>;
  for (const entry of entries) {
    if (counts[entry.choice] !== undefined) counts[entry.choice] += 1;
  }
  return counts;
}
