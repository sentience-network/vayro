import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { isRepresentative } from "@/lib/listing-images";
import {
  BookingForm,
  ApiButton,
  ReviewForm,
  ShareButton,
} from "@/components/ClientActions";
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
            status: { in: ["ACCEPTED", "COMPLETED"] },
          },
          select: { id: true },
        }))
      : false,
    representative = isRepresentative(listing.details),
    details = listing.details as Record<string, string>;
  return (
    <section className="section page">
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
          <b>Representative image:</b> supplied by Vayro because the owner did
          not upload photos. This is not the actual vehicle.
        </div>
      )}
      <div className="gallery">
        {listing.photos.map((photo, index) => (
          <img
            key={photo.id}
            className={index === 0 ? "primary" : ""}
            src={photo.url}
            alt={photo.alt || `${listing.title} photo ${index + 1}`}
          />
        ))}
      </div>
      <div className="detail">
        <article>
          <div className="spread">
            <span className="pill">{listing.category}</span>
            <span>
              ★ {rating} · {listing.reviews.length} reviews
            </span>
          </div>
          <div className="titleline">
            <h1>{listing.title}</h1>
            <ShareButton title={listing.title} />
          </div>
          <p>{listing.location}</p>
          <hr />
          <h3>Hosted by {listing.owner.name}</h3>
          <p>{listing.owner.bio || "Local owner and adventure enthusiast."}</p>
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
          <h3>Unavailable dates</h3>
          <p>
            {listing.bookings.length
              ? listing.bookings
                  .map(
                    (booking) =>
                      `${booking.startDate.toLocaleDateString()}–${booking.endDate.toLocaleDateString()}`,
                  )
                  .join(", ")
              : "No blocked dates"}
          </p>
          <h2>Guest reviews</h2>
          {mayReview && <ReviewForm listingId={listing.id} />}
          <div className="reviews">
            {listing.reviews.map((review) => (
              <blockquote key={review.id}>
                <b>{"★".repeat(review.rating)}</b>
                <p>“{review.comment}”</p>
                <small>— {review.author.name}</small>
              </blockquote>
            ))}
            {!listing.reviews.length && (
              <p className="muted">
                Be the first confirmed renter to leave a review.
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
              />
              <ApiButton
                url={`/api/favorites/${listing.id}`}
                label="♡ Save to favorites"
                className="outline"
              />
            </>
          ) : (
            <p>
              <a className="button" href="/login">
                Log in to request
              </a>
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
