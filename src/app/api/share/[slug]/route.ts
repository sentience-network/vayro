import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const market = await prisma.market.findUnique({ where: { slug } });
  if (!market) return NextResponse.json({ error: "Market not found" }, { status: 404 });

  const updated = await prisma.market.update({
    where: { id: market.id },
    data: { shareCount: { increment: 1 } },
  });

  await prisma.user.update({
    where: { id: market.creatorId },
    data: { creatorScore: { increment: 2 } },
  });

  return NextResponse.json({ shareCount: updated.shareCount });
}
