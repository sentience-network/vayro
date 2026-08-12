import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = request.headers.get("stripe-signature");
    if (!secret || !signature)
      return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    const event = stripe().webhooks.constructEvent(await request.text(), signature, secret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId && session.payment_status === "paid") {
        await db.$transaction(async tx => {
          const booking = await tx.booking.update({ where: { id: bookingId }, data: { status: "PAID", paymentStatus: "PAID", stripePaymentIntentId: String(session.payment_intent), paidAt: new Date() }, include: { listing: true } });
          await tx.notification.create({ data: { userId: booking.listing.ownerId, type: "BOOKING_PAID", title: "Booking paid", body: `${booking.listing.title} has been paid. Your payout is handled by Stripe.`, href: "/owner" } });
        });
      }
    }
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.bookingId) await db.booking.updateMany({ where: { id: session.metadata.bookingId, paymentStatus: "CHECKOUT_CREATED" }, data: { status: "PAYMENT_FAILED", paymentStatus: "FAILED" } });
    }
    if(event.type==="charge.refunded"){
      const charge=event.data.object as Stripe.Charge,paymentIntent=typeof charge.payment_intent==="string"?charge.payment_intent:charge.payment_intent?.id;
      if(paymentIntent)await db.booking.updateMany({where:{stripePaymentIntentId:paymentIntent},data:{status:"REFUNDED",paymentStatus:"REFUNDED",refundAmount:Math.round(charge.amount_refunded/100)}});
    }
    if(event.type==="refund.failed"){
      const refund=event.data.object as Stripe.Refund,paymentIntent=typeof refund.payment_intent==="string"?refund.payment_intent:refund.payment_intent?.id;
      if(paymentIntent)await db.booking.updateMany({where:{stripePaymentIntentId:paymentIntent,paymentStatus:"REFUND_PENDING"},data:{status:"DISPUTED",paymentStatus:"FAILED"}});
    }
    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      await db.user.updateMany({ where: { stripeConnectAccountId: account.id }, data: { stripeChargesEnabled: !!account.charges_enabled, stripePayoutsEnabled: !!account.payouts_enabled } });
    }
    if (event.type === "identity.verification_session.verified") {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const userId = session.metadata?.vayroUserId;
      if (userId) await db.user.update({ where: { id: userId }, data: { identityVerificationSessionId: session.id, identityVerificationStatus: "VERIFIED", identityVerifiedAt: new Date() } });
    }
    if (event.type === "identity.verification_session.requires_input") {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const userId = session.metadata?.vayroUserId;
      if (userId) await db.user.update({ where: { id: userId }, data: { identityVerificationStatus: "REQUIRES_INPUT" } });
    }
    if (event.type.startsWith("customer.subscription.")) {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.vayroUserId;
      const periodEnd = new Date((subscription.items.data[0]?.current_period_end || 0) * 1000);
      if (userId) await db.user.update({ where: { id: userId }, data: { stripeSubscriptionId: subscription.id, subscriptionPlan: subscription.metadata.plan || null, subscriptionEndsAt: Number.isNaN(periodEnd.getTime()) ? null : periodEnd, subscriptionStatus: ["active", "trialing"].includes(subscription.status) ? "ACTIVE" : subscription.status === "past_due" ? "PAST_DUE" : "CANCELED" } });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid webhook" }, { status: 400 });
  }
}
