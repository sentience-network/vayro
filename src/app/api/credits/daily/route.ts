import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { claimDailyBonus } from "@/lib/credits";
import { prisma } from "@/lib/db";

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const result = await claimDailyBonus(userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    return NextResponse.json({ ...result, credits: user?.credits ?? 0 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not claim daily bonus" }, { status: 500 });
  }
}
