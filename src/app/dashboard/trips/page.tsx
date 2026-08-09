import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ApiButton, RedirectButton } from "@/components/ClientActions";

export default async function Trips({ searchParams }: { searchParams: Promise<{ booked?: string; payment?: string }> }) {
  const user = await getUser(); if (!user) redirect("/login"); const query = await searchParams;
  const [trips, favorites] = await Promise.all([
    db.booking.findMany({ where: { renterId: user.id }, include: { listing: { include: { photos: true, owner: true } } }, orderBy: { createdAt: "desc" } }),
    db.favorite.findMany({ where: { userId: user.id }, include: { listing: { include: { photos: true } } } }),
  ]);
  return <section className="section page"><span className="eyebrow">RENTER DASHBOARD</span><h1>My trips</h1>
    {query.booked && <div className="success">Your request was sent. The owner will review it soon.</div>}
    {query.payment === "success" && <div className="success">Stripe received your payment. The signed webhook confirms it here.</div>}
    <div className="rows">{trips.map(trip => <div className="row" key={trip.id}><img src={trip.listing.photos[0]?.url} alt=""/><div className="grow"><span className={`status ${trip.status.toLowerCase()}`}>{trip.status}</span> <span className="pill">{trip.paymentStatus}</span><h3>{trip.listing.title}</h3><p>{trip.startDate.toLocaleDateString()} — {trip.endDate.toLocaleDateString()} · ${trip.totalPrice}</p><div className="actions">{trip.status === "ACCEPTED" && trip.paymentStatus !== "PAID" && <RedirectButton url={`/api/bookings/${trip.id}/checkout`} label="Pay securely with Stripe"/>}<Link href={`/messages?with=${trip.listing.ownerId}`}>Message {trip.listing.owner.name} →</Link>{["PENDING", "ACCEPTED"].includes(trip.status) && <ApiButton url={`/api/bookings/${trip.id}`} method="PATCH" body={{ status: "CANCELLED" }} label="Cancel trip" className="outline" confirmText="Cancel this trip request?"/>}</div></div></div>)}
      {!trips.length && <div className="empty"><h3>No trips yet</h3><p>Your next escape starts with a ride.</p><Link className="button" href="/browse">Explore the fleet</Link></div>}
    </div><h2>Saved rides</h2><div className="rows">{favorites.map(favorite => <Link className="row" href={`/listings/${favorite.listing.slug}`} key={favorite.listingId}><img src={favorite.listing.photos[0]?.url} alt=""/><div><h3>{favorite.listing.title}</h3><p>${favorite.listing.pricePerDay}/day</p></div></Link>)}{!favorites.length && <p className="muted">Tap “Save” while browsing to keep favorites here.</p>}</div>
  </section>;
}
