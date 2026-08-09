import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { status } = await request.json();
    const booking = await db.booking.findUnique({
      where: { id },
      include: { listing: true },
    });
    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (status === "CANCELLED") {
      if (
        booking.renterId !== user.id ||
        !["PENDING", "ACCEPTED"].includes(booking.status)
      )
        throw new Error("FORBIDDEN");
      await db.booking.update({ where: { id }, data: { status } });
      return NextResponse.json({ ok: true });
    }
    if (
      !["ACCEPTED", "DECLINED"].includes(status) ||
      booking.listing.ownerId !== user.id ||
      booking.status !== "PENDING"
    )
      throw new Error("FORBIDDEN");
    await db.$transaction(async (tx) => {
      if (status === "ACCEPTED") {
        const overlap = await tx.booking.findFirst({
          where: {
            id: { not: id },
            listingId: booking.listingId,
            status: "ACCEPTED",
            startDate: { lt: booking.endDate },
            endDate: { gt: booking.startDate },
          },
        });
        if (overlap) throw new Error("Dates are no longer available");
        await tx.booking.updateMany({
          where: {
            id: { not: id },
            listingId: booking.listingId,
            status: "PENDING",
            startDate: { lt: booking.endDate },
            endDate: { gt: booking.startDate },
          },
          data: { status: "DECLINED" },
        });
      }
      await tx.booking.update({ where: { id }, data: { status } });
      await tx.notification.create({ data: { userId: booking.renterId, type: "BOOKING_STATUS", title: `Booking ${status.toLowerCase()}`, body: `${booking.listing.title} was ${status.toLowerCase()}.`, href: "/dashboard/trips" } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message !== "FORBIDDEN"
            ? error.message
            : "Forbidden",
      },
      { status: 403 },
    );
  }
}
