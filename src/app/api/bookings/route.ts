import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bookingSchema } from "@/lib/validation";
import { differenceInCalendarDays } from "date-fns";
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(),
      parsed = bookingSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    const { listingId, startDate, endDate, note } = parsed.data;
    const result = await db.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({ where: { id: listingId } });
      if (
        !listing ||
        listing.status !== "ACTIVE" ||
        listing.ownerId === user.id
      )
        throw new Error("Unavailable");
      const overlap = await tx.booking.findFirst({
        where: {
          listingId,
          status: { in: ["PENDING", "ACCEPTED"] },
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      });
      if (overlap) throw new Error("Dates overlap an existing request");
      const blocked = await tx.availabilityBlock.findFirst({
        where: { listingId, startDate: { lt: endDate }, endDate: { gt: startDate } },
      });
      if (blocked) throw new Error("The owner blocked these dates");
      const days = differenceInCalendarDays(endDate, startDate),
        subtotal = days * listing.pricePerDay,
        isPlus =
          user.subscriptionStatus === "ACTIVE" &&
          (!user.subscriptionEndsAt || user.subscriptionEndsAt > new Date()),
        serviceFeeRate = isPlus ? 750 : 1000,
        serviceFee = Math.round((subtotal * serviceFeeRate) / 10000),
        renterFee =
          listing.feePayer === "RENTER"
            ? serviceFee
            : listing.feePayer === "SPLIT"
              ? Math.ceil(serviceFee / 2)
              : 0,
        ownerFee = serviceFee - renterFee,
        ownerPayout = subtotal - ownerFee;
      const booking = await tx.booking.create({
        data: {
          listingId,
          renterId: user.id,
          startDate,
          endDate,
          note,
          subtotal,
          serviceFee,
          serviceFeeRate,
          renterFee,
          ownerFee,
          ownerPayout,
          totalPrice: subtotal + renterFee,
        },
      });
      await tx.notification.create({ data: { userId: listing.ownerId, type: "BOOKING_REQUEST", title: "New booking request", body: `${user.name} requested ${listing.title}.`, href: "/owner" } });
      return booking;
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to book" },
      { status: 409 },
    );
  }
}
