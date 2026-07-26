import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AD_PARTNERS, CREDIT_REWARDS } from "@/lib/constants";
import { grantCredits } from "@/lib/credits";

const schema = z.object({
  marketId: z.string().optional(),
  partnerBonus: z.boolean().optional(),
});

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json().catch(() => ({})));
    const partner = AD_PARTNERS[Math.floor(Math.random() * AD_PARTNERS.length)];
    const revenueCents = 35 + Math.floor(Math.random() * 40);
    const creditReward = body.partnerBonus
      ? CREDIT_REWARDS.partnerBonus
      : CREDIT_REWARDS.adWatch;

    if (body.marketId) {
      const market = await prisma.market.findUnique({ where: { id: body.marketId } });
      if (!market) {
        return NextResponse.json({ error: "Market not found" }, { status: 404 });
      }
    }

    const adView = await prisma.adView.create({
      data: {
        userId,
        marketId: body.marketId,
        partnerName: partner.name,
        revenueCents,
        creditReward,
        completed: true,
      },
    });

    if (body.marketId) {
      await prisma.market.update({
        where: { id: body.marketId },
        data: { adPoolCents: { increment: revenueCents } },
      });
    }

    await grantCredits(userId, creditReward, body.partnerBonus ? "partner_ad_reward" : "ad_watch", {
      adViewId: adView.id,
      partner: partner.name,
      marketId: body.marketId,
    });

    // Nudge activity score if already entered
    if (body.marketId) {
      await prisma.marketEntry.updateMany({
        where: { userId, marketId: body.marketId },
        data: { activityScore: { increment: 1 } },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    return NextResponse.json({
      adView: {
        id: adView.id,
        partnerName: partner.name,
        tagline: partner.tagline,
        color: partner.color,
        revenueCents,
        creditReward,
      },
      credits: user?.credits ?? 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid ad request" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Ad watch failed" }, { status: 500 });
  }
}
