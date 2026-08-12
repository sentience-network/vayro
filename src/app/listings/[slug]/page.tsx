import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { isRepresentative, vehiclePhotoPlaceholder } from "@/lib/listing-images";
import {
  BookingForm,
  ApiButton,
  ReviewForm,
  ShareButton,
  ListingViewTracker,
} from "@/components/ClientActions";
import type { Metadata } from "next";
import { OwnerLink } from "@/components/MarketplaceEnhancements";
import { TireRating } from "@/components/TireRating";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params;const listing=await db.listing.findUnique({where:{slug},select:{title:true,description:true,category:true,details:true,photos:{take:1,select:{url:true}}}});if(!listing)return{title:"Listing not found"};const details=listing.details as Record<string,string>,photo=isRepresentative(details)?vehiclePhotoPlaceholder(listing.category,details):listing.photos[0]?.url;return{title:listing.title,description:listing.description.slice(0,155),openGraph:{images:photo?[photo]:[]}};}
export default async function ListingDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params,
    user = await getUser();
  const listing = await db.listing.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { position: "asc" } },
      owner: true,
      reviews: { include: { author: true }, orderBy: { createdAt: "desc" } },
      bookings: {
        where: { status: { in: ["REQUESTED", "ACCEPTED", "PAYMENT_REQUIRED", "PAID", "ACTIVE"] } },
        select: { startDate: true, endDate: true },
      },
    },
  });
  if (!listing) notFound();
  const rating = listing.reviews.length
      ? (
          listing.reviews.reduce((sum, review) => sum + review.rating, 0) /
          listing.reviews.length
        ).toFixed(1)
      : "New",
    mayReview = user
      ? !!(await db.booking.findFirst({
          where: {
            listingId: listing.id,
            renterId: user.id,
            status: "COMPLETED",
            endDate: { lte: new Date() },
          },
          select: { id: true },
        }))
      : false,
    representative = isRepresentative(listing.details),
    details = listing.details as Record<string, string>;
  const ownerListingCount = await db.listing.count({where:{ownerId:listing.ownerId,status:"ACTIVE"}});
  const displayPhoto = representative ? vehiclePhotoPlaceholder(listing.category, details) : listing.photos[0]?.url || vehiclePhotoPlaceholder(listing.category, details);
  const structuredData = {"@context":"https://schema.org","@type":"Product",name:listing.title,description:listing.description,image:representative?[displayPhoto]:listing.photos.map(photo=>photo.url),offers:{"@type":"Offer",price:listing.pricePerDay,priceCurrency:"USD",availability:"https://schema.org/InStock",url:`${process.env.NEXT_PUBLIC_APP_URL||"https://vayro.onrender.com"}/listings/${listing.slug}`},aggregateRating:listing.reviews.length?{"@type":"AggregateRating",ratingValue:rating,reviewCount:listing.reviews.length}:undefined};
  return (
    <section className="section page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,"\\u003c")}} />
      <ListingViewTracker ride={{slug:listing.slug,title:listing.title,location:listing.location,price:listing.pricePerDay,photo:displayPhoto}} />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/browse">Explore</Link>
        <span>›</span>
        <Link href={`/browse?category=${encodeURIComponent(listing.category)}`}>
          {listing.category}
        </Link>
        <span>›</span>
        <span>{listing.title}</span>
      </nav>
      {representative && (
        <div className="photo-disclaimer">
          <b>REPRESENTATIVE GRAPHIC — NOT THE ACTUAL VEHICLE:</b> the owner has not uploaded photos. Confirm condition, identity, documents, and specifications directly with the owner before the handoff.
        </div>
      )}
      <div className="gallery">
        {listing.photos.map((photo, index) => (
          <img
            key={photo.id}
            className={index === 0 ? "primary" : ""}
            src={representative ? vehiclePhotoPlaceholder(listing.category, details) : photo.url}
            alt={photo.alt || `${listing.title} photo ${index + 1}`}
          />
        ))}
      </div>
      <div className="detail">
        <article>
          <div className="spread">
            <span className="pill">{listing.category}</span>
            <span>
              {rating==="New"?<span className="muted">Not yet rated</span>:<><TireRating rating={Number(rating)}/> · {listing.reviews.length} verified {listing.reviews.length===1?"review":"reviews"}</>}
            </span>
          </div>
          <div className="titleline">
            <h1>{listing.title}</h1>
            <ShareButton title={listing.title} />
          </div>
          <p>{listing.location}</p>
          <hr />
          <h3>Hosted by <OwnerLink id={listing.owner.id} name={listing.owner.name}/></h3>
          <p>{listing.owner.bio || "Local owner and adventure enthusiast."}</p>
          <div className="hostsignals"><span>✓ Identity workflow</span><span>✓ {ownerListingCount} active {ownerListingCount===1?"listing":"listings"}</span><span>✓ Secure in-app messages</span></div>
          <hr />
          <h2>About this ride</h2>
          <p className="prose">{listing.description}</p>
          {(details.year || details.make || details.model) && (
            <>
              <h3>Vehicle details</h3>
              <div className="tags">
                {details.year && <span>{details.year}</span>}
                {details.make && <span>{details.make}</span>}
                {details.model && <span>{details.model}</span>}
              </div>
            </>
          )}
          <h3>Features</h3>
          <div className="tags">
            {listing.features.map((feature) => (
              <span key={feature}>{feature}</span>
            ))}
          </div>
          <h3>Rules</h3>
          <ul>
            {listing.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <h3>Delivery</h3>
          <p>{listing.deliveryOptions.join(" · ") || "Owner pickup"}</p>
          <p>
            <b>Security deposit:</b> ${listing.securityDeposit}
          </p>
          {(details.weeklyDiscount||details.monthlyDiscount)&&<div className="discountcallout"><b>Longer-trip savings</b>{details.weeklyDiscount&&<span>{details.weeklyDiscount}% off weekly rentals</span>}{details.monthlyDiscount&&<span>{details.monthlyDiscount}% off monthly rentals</span>}</div>}
          <h3>Unavailable dates</h3>
          <p className="availability">
            {listing.bookings.length
              ? listing.bookings
                  .map(
                    (booking) =>
                      `${booking.startDate.toLocaleDateString()}–${booking.endDate.toLocaleDateString()}`,
                  )
                  .join(", ")
              : "No blocked dates"}
          </p>
          <p className="notice"><b>Know before you book:</b> You will not be charged until the owner accepts. Review the vehicle, trip dates, fee breakdown, and cancellation terms before secure checkout.</p>
          <h2>Verified renter ratings and comments</h2>
          <p className="muted">Only renters who completed a trip can post here. Questions and pre-trip communication stay private in Messages.</p>
          {mayReview ? <ReviewForm listingId={listing.id} /> : user?.id!==listing.ownerId ? <Link className="outline" href={user?`/messages?with=${listing.ownerId}`:"/login"}>{user?"Message the owner privately":"Log in to message the owner"}</Link> : null}
          <div className="reviews">
            {listing.reviews.map((review) => (
              <blockquote key={review.id}>
                <TireRating rating={review.rating}/>
                <p>“{review.comment}”</p>
                <small>— {review.author.name} · Verified completed rental</small>
              </blockquote>
            ))}
            {!listing.reviews.length && (
              <p className="muted">
                No verified renter comments yet.
              </p>
            )}
          </div>
        </article>
        <aside className="panel">
          {user?.id === listing.ownerId ? (
            <p>
              <a className="button" href={`/owner/${listing.id}/edit`}>
                Edit this listing
              </a>
            </p>
          ) : user ? (
            <>
              <BookingForm
                listingId={listing.id}
                price={listing.pricePerDay}
                feePayer={listing.feePayer}
                feeRate={user.subscriptionStatus === "ACTIVE" ? 7.5 : 10}
                representative={representative}
              />
              <ApiButton
                url={`/api/favorites/${listing.id}`}
                label="♡ Save to favorites"
                className="outline"
              />
              <div className="bookingtrust"><span>🔒 Payment handled by Stripe</span><span>✓ No charge for requesting</span><span>💬 Message the owner anytime</span></div>
            </>
          ) : (
            <p>
              <a className="button" href="/login">
                Log in to request
              </a>
            </p>
          )}
          <Link className="reportlink" href={`/support?subject=${encodeURIComponent(`Listing concern: ${listing.title}`)}`}>Report this listing or ask for help</Link>
        </aside>
      </div>
    </section>
  );
}
