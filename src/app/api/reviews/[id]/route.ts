import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
const schema = z.object({ rating: z.coerce.number().int().min(1).max(5), comment: z.string().trim().min(5).max(1000) });
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const user = await requireUser(); const { id } = await params; const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Choose 1–5 tires and write a comment of at least 5 characters" }, { status: 400 }); const booking = await db.booking.findFirst({ where: { listingId: id, renterId: user.id, status: "COMPLETED", endDate: { lte: new Date() } } }); if (!booking) return NextResponse.json({ error: "Only renters who completed a trip can rate and comment on this vehicle" }, { status: 403 }); await db.review.upsert({ where: { authorId_listingId: { authorId: user.id, listingId: id } }, create: { authorId: user.id, listingId: id, ...parsed.data }, update: parsed.data }); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Login required" }, { status: 401 }); }
}
