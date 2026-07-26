import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/markets";
import { grantCredits } from "@/lib/credits";
import { CATEGORIES, CREDIT_REWARDS, DEFAULT_ENTRY_FEE } from "@/lib/constants";

export async function GET() {
  const markets = await prisma.market.findMany({
    include: {
      creator: { select: { id: true, username: true, displayName: true } },
      _count: { select: { entries: true } },
    },
    orderBy: [{ status: "asc" }, { participantCount: "desc" }],
  });
  return NextResponse.json({ markets });
}

const createSchema = z.object({
  title: z.string().min(8).max(120),
  description: z.string().min(20).max(800),
  category: z.enum(CATEGORIES as unknown as [string, ...string[]]),
  options: z.array(z.string().min(1).max(40)).min(2).max(6),
  entryFee: z.number().int().min(5).max(50).optional(),
  resolvesAt: z.string().datetime(),
});

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = createSchema.parse(await req.json());
    const resolvesAt = new Date(body.resolvesAt);
    if (resolvesAt.getTime() <= Date.now() + 60 * 60 * 1000) {
      return NextResponse.json(
        { error: "Resolve time must be at least one hour from now" },
        { status: 400 }
      );
    }

    const options = body.options.map((o) => o.trim()).filter(Boolean);
    if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) {
      return NextResponse.json({ error: "Options must be unique" }, { status: 400 });
    }

    const market = await prisma.market.create({
      data: {
        slug: slugify(body.title),
        title: body.title.trim(),
        description: body.description.trim(),
        category: body.category,
        optionsJson: JSON.stringify(options),
        entryFee: body.entryFee ?? DEFAULT_ENTRY_FEE,
        resolvesAt,
        creatorId: userId,
      },
    });

    await grantCredits(userId, CREDIT_REWARDS.createMarket, "create_market_bonus", {
      marketId: market.id,
    });

    return NextResponse.json({ market }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid market details" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not create market" }, { status: 500 });
  }
}
