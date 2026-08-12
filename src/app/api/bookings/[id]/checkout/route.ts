import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body=await request.json().catch(()=>({}));
    if(body.policyAccepted!==true)return NextResponse.json({error:"Accept the Terms and Cancellation Policy before checkout"},{status:400});
    const booking = await db.booking.findUnique({ where: { id }, include: { listing: { include: { owner: true } } } });
    if (!booking || booking.renterId !== user.id) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (!["ACCEPTED", "PAYMENT_REQUIRED", "PAYMENT_FAILED"].includes(booking.status)) return NextResponse.json({ error: "The owner must accept before payment" }, { status: 409 });
    if (booking.paymentStatus === "PAID") return NextResponse.json({ error: "Booking is already paid" }, { status: 409 });
    const destination = booking.listing.owner.stripeConnectAccountId;
    if (!destination || !booking.listing.owner.stripeChargesEnabled || !booking.listing.owner.stripePayoutsEnabled) return NextResponse.json({ error: "Owner must finish Stripe payout onboarding before payment" }, { status: 409 });
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const session = await stripe().checkout.sessions.create({
      mode: "payment", customer_email: user.email, client_reference_id: booking.id,
      line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: booking.totalPrice * 100, product_data: { name: `${booking.listing.title} rental`, description: `${booking.startDate.toISOString().slice(0, 10)} to ${booking.endDate.toISOString().slice(0, 10)}` } } }],
      payment_intent_data: { application_fee_amount: booking.serviceFee * 100, transfer_data: { destination }, metadata: { bookingId: booking.id } },
      metadata: { bookingId: booking.id, type: "BOOKING" },
      success_url: `${origin}/dashboard/trips?payment=success`, cancel_url: `${origin}/dashboard/trips?payment=canceled`,
    });
    await db.$transaction([db.booking.update({ where: { id: booking.id }, data: { status: "PAYMENT_REQUIRED", stripeCheckoutSessionId: session.id, paymentStatus: "CHECKOUT_CREATED",policyVersion:"2026-08-12" } }),db.policyAcceptance.upsert({where:{userId_policy_version:{userId:user.id,policy:"BOOKING_TERMS",version:"2026-08-12"}},create:{userId:user.id,policy:"BOOKING_TERMS",version:"2026-08-12"},update:{acceptedAt:new Date()}})]);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start payment" }, { status: 500 });
  }
}
