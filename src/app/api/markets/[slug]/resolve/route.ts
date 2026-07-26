import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseOptions } from "@/lib/markets";
import { distributeMarketRevenue } from "@/lib/revenue";

const schema = z.object({
  resolvedOption: z.string().min(1),
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
    const market = await prisma.market.findUnique({
      where: { slug },
      include: { entries: true },
    });

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }
    if (market.creatorId !== userId) {
      return NextResponse.json({ error: "Only the creator can resolve" }, { status: 403 });
    }
    if (market.status !== "OPEN") {
      return NextResponse.json({ error: "Market already resolved" }, { status: 400 });
    }

    const options = parseOptions(market.optionsJson);
    if (!options.includes(body.resolvedOption)) {
      return NextResponse.json({ error: "Invalid outcome" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.market.update({
        where: { id: market.id },
        data: {
          status: "RESOLVED",
          resolvedOption: body.resolvedOption,
        },
      });

      for (const entry of market.entries) {
        const isCorrect = entry.choice === body.resolvedOption;
        await tx.marketEntry.update({
          where: { id: entry.id },
          data: { isCorrect },
        });

        const user = await tx.user.findUnique({ where: { id: entry.userId } });
        if (!user) continue;
        const correctPredictions = user.correctPredictions + (isCorrect ? 1 : 0);
        const totalPredictions = Math.max(1, user.totalPredictions);
        await tx.user.update({
          where: { id: entry.userId },
          data: {
            correctPredictions,
            accuracyScore: correctPredictions / totalPredictions,
          },
        });
      }
    });

    const distribution = await distributeMarketRevenue(market.id);
    return NextResponse.json({ ok: true, distribution });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid resolve request" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not resolve market" }, { status: 500 });
  }
}
