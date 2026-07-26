import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseOptions } from "@/lib/markets";
import { spendCredits } from "@/lib/credits";

const schema = z.object({
  choice: z.string().min(1),
  adViewId: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const body = schema.parse(await req.json());
    const market = await prisma.market.findUnique({ where: { slug } });
    if (!market || market.status !== "OPEN") {
      return NextResponse.json({ error: "Market is not open" }, { status: 400 });
    }
    if (market.resolvesAt.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Market has closed" }, { status: 400 });
    }

    const options = parseOptions(market.optionsJson);
    if (!options.includes(body.choice)) {
      return NextResponse.json({ error: "Invalid choice" }, { status: 400 });
    }

    const existing = await prisma.marketEntry.findUnique({
      where: { userId_marketId: { userId, marketId: market.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already joined this market" }, { status: 409 });
    }

    const adView = await prisma.adView.findFirst({
      where: {
        id: body.adViewId,
        userId,
        marketId: market.id,
        completed: true,
      },
    });
    if (!adView) {
      return NextResponse.json(
        { error: "Watch a partner ad before joining" },
        { status: 400 }
      );
    }

    await spendCredits(userId, market.entryFee, "market_entry", {
      marketId: market.id,
      choice: body.choice,
    });

    const entry = await prisma.marketEntry.create({
      data: {
        userId,
        marketId: market.id,
        choice: body.choice,
        feePaid: market.entryFee,
        activityScore: 1,
      },
    });

    await prisma.market.update({
      where: { id: market.id },
      data: { participantCount: { increment: 1 } },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { totalPredictions: { increment: 1 } },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid join request" }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes("Not enough")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not join market" }, { status: 500 });
  }
}
