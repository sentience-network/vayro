import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { z } from "zod";
const schema = z.object({
  recipientId: z.string().min(1),
  bookingId: z.string().optional(),
  body: z.string().trim().min(1).max(2000),
});
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(),
      parsed = schema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: "Write a message under 2,000 characters" },
        { status: 400 },
      );
    if (parsed.data.recipientId === user.id)
      return NextResponse.json(
        { error: "You cannot message yourself" },
        { status: 400 },
      );
    const recipient = await db.user.findUnique({
      where: { id: parsed.data.recipientId },
      select: { id: true, disabled: true },
    });
    if (!recipient || recipient.disabled)
      return NextResponse.json(
        { error: "This recipient is unavailable" },
        { status: 404 },
      );
    if (parsed.data.bookingId) {
      const booking = await db.booking.findUnique({
        where: { id: parsed.data.bookingId },
        include: { listing: { select: { ownerId: true } } },
      });
      if (
        !booking ||
        ![booking.renterId, booking.listing.ownerId].includes(user.id) ||
        ![booking.renterId, booking.listing.ownerId].includes(recipient.id)
      )
        return NextResponse.json(
          { error: "Invalid booking conversation" },
          { status: 403 },
        );
    }
    const [message] = await db.$transaction([
      db.message.create({ data: { ...parsed.data, senderId: user.id } }),
      db.notification.create({ data: { userId: recipient.id, type: "MESSAGE", title: `Message from ${user.name}`, body: parsed.data.body.slice(0, 120), href: `/messages?with=${user.id}` } }),
    ]);
    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
