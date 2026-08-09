import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
const schema = z.object({ sessionId: z.string().min(8).max(100), name: z.enum(["PAGE_VIEW", "SEARCH", "LISTING_VIEW", "BOOKING_STARTED", "BOOKING_CREATED", "PAYMENT_STARTED", "PAYMENT_COMPLETED", "OWNER_ONBOARDING_STARTED"]), path: z.string().max(300), metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional() });
export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  const user = await getUser(); await db.analyticsEvent.create({ data: { ...parsed.data, metadata: parsed.data.metadata || {}, userId: user?.id } }); return NextResponse.json({ ok: true });
}
