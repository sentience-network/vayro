import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ApiButton, RedirectButton } from "@/components/ClientActions";
import { OnboardingChecklist, QualityMeter } from "@/components/MarketplaceEnhancements";
import { listingQuality } from "@/lib/listing-quality";

export default async function OwnerDashboard() {
  const user = await getUser(); if (!user) redirect("/login");
  const listings = await db.listing.findMany({ where: { ownerId: user.id }, include: { photos: true, verification:true, bookings: { include: { renter: true } } }, orderBy: { createdAt: "desc" } });
  const bookings = listings.flatMap(listing => listing.bookings.map(booking => ({ ...booking, listing })));
  const earnings = bookings.filter(x => ["PAID", "ACTIVE", "COMPLETED"].includes(x.status)).reduce((sum, x) => sum + x.ownerPayout, 0);
  const ownerAgreement=await db.policyAcceptance.findUnique({where:{userId_policy_version:{userId:user.id,policy:"OWNER_AGREEMENT",version:"2026-08-12"}}});
  const checklist=[{label:"Create a vehicle listing",done:listings.length>0,href:"/owner/new"},{label:"Upload actual vehicle photos",done:listings.some(l=>l.photos.some(p=>p.uploadedByOwner&&!p.isRepresentative)),href:listings[0]?`/owner/${listings[0].id}/edit`:"/owner/new"},{label:"Submit vehicle verification",done:listings.some(l=>!!l.verification),href:"/owner/tools"},{label:"Set availability",done:listings.some(l=>l.status==="ACTIVE"),href:"/owner/tools"},{label:"Connect Stripe payouts",done:user.stripePayoutsEnabled,href:"/owner"},{label:"Accept owner agreement",done:!!ownerAgreement,href:"/owner-agreement"}];
  return <section className="section page"><div className="sectionhead"><div><span className="eyebrow">OWNER DASHBOARD</span><h1>Your business</h1><RedirectButton url="/api/stripe/connect" label={user.stripePayoutsEnabled ? "Manage Stripe payouts" : "Set up Stripe payouts"} className="outline"/></div><Link className="button" href="/owner/new">+ New listing</Link></div>
    <OnboardingChecklist items={checklist}/>
    <div className="stats"><div><b>${earnings.toLocaleString()}</b><span>confirmed earnings</span></div><div><b>{bookings.filter(x => x.status === "REQUESTED").length}</b><span>pending requests</span></div><div><b>{listings.length}</b><span>listings</span></div></div>
    <h2>Booking requests</h2><div className="rows">{bookings.map(booking => <div className="row" key={booking.id}><img src={booking.listing.photos[0]?.url} alt=""/><div><span className={`status ${booking.status.toLowerCase()}`}>{booking.status.replaceAll("_", " ")}</span> <span className="pill">{booking.paymentStatus}</span><h3>{booking.listing.title} · {booking.renter.name}</h3><p>{booking.startDate.toLocaleDateString()} — {booking.endDate.toLocaleDateString()} · ${booking.totalPrice}</p><div className="actions">{booking.status === "REQUESTED" && <><ApiButton url={`/api/bookings/${booking.id}`} method="PATCH" body={{ status: "ACCEPTED" }} label="Accept"/><ApiButton url={`/api/bookings/${booking.id}`} method="PATCH" body={{ status: "DECLINED" }} label="Decline" className="outline"/></>}<Link href={`/messages?with=${booking.renterId}`}>Message renter →</Link></div></div></div>)}{!bookings.length && <div className="empty"><h3>No requests yet</h3><p>Booking requests will appear here as travelers discover your listings.</p></div>}</div>
    <h2>Your listings and drafts</h2><div className="rows">{listings.map(listing => {const quality=listingQuality(listing);return <div className="row ownerlisting" key={listing.id}><img src={listing.photos[0]?.url} alt=""/><div className="grow"><h3>{listing.title}</h3><p><span className={`status ${listing.status.toLowerCase()}`}>{listing.status==="PAUSED"?"DRAFT / PAUSED":listing.status}</span> · ${listing.pricePerDay}/day</p><QualityMeter {...quality}/><div className="actions"><Link className="outline" href={`/owner/${listing.id}/edit`}>Edit</Link><ApiButton url={`/api/listings/${listing.id}`} method="PATCH" body={{ status: listing.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }} label={listing.status === "ACTIVE" ? "Pause" : "Publish"} className="outline"/><ApiButton url={`/api/listings/${listing.id}`} method="DELETE" label="Delete" className="danger" confirmText="Delete this listing permanently?"/></div></div></div>})}</div>
  </section>;
}
