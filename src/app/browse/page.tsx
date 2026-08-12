import Link from "next/link";
import { BookingStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ListingCard } from "@/components/ListingCard";
import { SaveSearchButton } from "@/components/FeatureForms";
import { AdSense } from "@/components/AdSense";
import { QUICK_CATEGORIES } from "@/lib/marketplace";
const PAGE_SIZE = 6;
export default async function Browse({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const q = await searchParams,
    user = await getUser();
  const min = Math.max(0, Number(q.min) || 0),
    max = Math.max(min, Number(q.max) || 100000),
    page = Math.max(1, Number(q.page) || 1);
  const start =
      q.start && /^\d{4}-\d{2}-\d{2}$/.test(q.start) ? new Date(q.start) : null,
    end = q.end && /^\d{4}-\d{2}-\d{2}$/.test(q.end) ? new Date(q.end) : null;
  const validDates = !!(start && end && end > start);
  const days = validDates ? Math.ceil((end!.getTime() - start!.getTime()) / 86400000) : 0;
  const keyword = q.q?.trim();
  const savedQuery = Object.fromEntries(Object.entries(q).filter(([key,value]) => key !== "page" && Boolean(value)));
  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    AND: [
      keyword
        ? {
            OR: [
              { title: { contains: keyword, mode: "insensitive" } },
              { description: { contains: keyword, mode: "insensitive" } },
              { location: { contains: keyword, mode: "insensitive" } },
            ],
          }
        : {},
      q.location
        ? { location: { contains: q.location, mode: "insensitive" } }
        : {},
      q.category
        ? { category: { equals: q.category, mode: "insensitive" } }
        : {},
      q.make ? { details: { path: ["make"], string_contains: q.make } } : {},
      q.model ? { details: { path: ["model"], string_contains: q.model } } : {},
      q.year ? { details: { path: ["year"], equals: q.year } } : {},
      q.seats ? { details: { path: ["seats"], equals: q.seats } } : {},
      q.transmission ? { details: { path: ["transmission"], equals: q.transmission } } : {},
      q.fuelType ? { details: { path: ["fuelType"], string_contains: q.fuelType } } : {},
      q.instantBook === "true" ? { instantBook: true } : {},
      q.photos==="representative"?{OR:[{details:{path:["_photoSource"],equals:"VAYRO_PLACEHOLDER"}},{details:{path:["_photoSource"],equals:"VAYRO_REPRESENTATIVE"}}]}:q.photos==="actual"?{details:{path:["_photoSource"],equals:"OWNER"}}:{},
      q.delivery ? { deliveryOptions: { has: q.delivery } } : {},
      validDates
        ? {
            bookings: {
              none: {
                status: { in: [BookingStatus.REQUESTED, BookingStatus.ACCEPTED, BookingStatus.PAYMENT_REQUIRED, BookingStatus.PAID, BookingStatus.ACTIVE] },
                startDate: { lt: end },
                endDate: { gt: start },
              },
            },
          }
        : {},
    ],
    pricePerDay: { gte: min, lte: max },
  };
  const orderBy: Prisma.ListingOrderByWithRelationInput =
    q.sort === "price-asc"
      ? { pricePerDay: "asc" }
      : q.sort === "price-desc"
        ? { pricePerDay: "desc" }
        : q.sort === "rating"
          ? { reviews: { _count: "desc" } }
          : { createdAt: "desc" };
  const [count, listings, favorites] = await Promise.all([
    db.listing.count({ where }),
    db.listing.findMany({
      where,
      include: { photos: true, reviews: true },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    user
      ? db.favorite.findMany({
          where: { userId: user.id },
          select: { listingId: true },
        })
      : Promise.resolve([]),
  ]);
  const favoriteIds = new Set(favorites.map((x) => x.listingId)),
    pages = Math.ceil(count / PAGE_SIZE);
  const pageHref = (next: number) =>
    `/browse?${new URLSearchParams({ ...q, page: String(next) }).toString()}`;
  return (
    <section className="section page">
      <span className="eyebrow">FIND YOUR WAY OUT</span>
      <h1>Explore the fleet</h1>
      <div className="quickfilters" aria-label="Popular categories">
        {QUICK_CATEGORIES.map(category => <Link className={q.category === category ? "active" : ""} key={category} href={category === "Luxury" ? "/lux" : `/browse?${new URLSearchParams({...q,category,page:"1"})}`}>{category === "Luxury" ? "Vayro Lux" : category}</Link>)}
        <Link className={q.photos==="representative"?"active":""} href={`/browse?${new URLSearchParams({...q,photos:"representative",page:"1"})}`}>No actual photos</Link>
      </div>
      <form className="filters improved">
        <input
          name="q"
          aria-label="Search vehicles"
          placeholder="Search make, model, or adventure"
          defaultValue={q.q}
        />
        <input
          name="location"
          aria-label="Location"
          placeholder="Location"
          defaultValue={q.location}
        />
        <select
          name="category"
          aria-label="Category"
          defaultValue={q.category || ""}
        >
          <option value="">All categories</option>
          {[
            "Car",
            "Truck",
            "SUV",
            "Luxury",
            "RV",
            "Camper van",
            "Travel trailer",
            "Boat",
            "Jet ski",
            "Motorcycle",
            "ATV",
            "UTV",
            "Other",
          ].map((x) => (
            <option key={x} value={x}>{x === "Luxury" ? "Vayro Lux" : x}</option>
          ))}
        </select>
        <input name="make" aria-label="Vehicle make" placeholder="Make" defaultValue={q.make}/>
        <input name="model" aria-label="Vehicle model" placeholder="Model" defaultValue={q.model}/>
        <input name="year" aria-label="Vehicle year" inputMode="numeric" placeholder="Year" defaultValue={q.year}/>
        <input name="seats" aria-label="Minimum seats" type="number" min="1" max="30" placeholder="Seats" defaultValue={q.seats}/>
        <select name="transmission" aria-label="Transmission" defaultValue={q.transmission||""}><option value="">Any transmission</option><option>Automatic</option><option>Manual</option></select>
        <input name="fuelType" aria-label="Fuel or power type" placeholder="Gas, electric…" defaultValue={q.fuelType}/>
        <input
          name="min"
          aria-label="Minimum price"
          type="number"
          min="0"
          placeholder="Min $"
          defaultValue={q.min}
        />
        <input
          name="max"
          aria-label="Maximum price"
          type="number"
          min="0"
          placeholder="Max $"
          defaultValue={q.max}
        />
        <input
          name="start"
          aria-label="Start date"
          type="date"
          defaultValue={q.start}
        />
        <input
          name="end"
          aria-label="End date"
          type="date"
          defaultValue={q.end}
        />
        <select
          name="delivery"
          aria-label="Delivery option"
          defaultValue={q.delivery || ""}
        >
          <option value="">Any pickup or delivery</option>
          <option value="Owner pickup">Owner pickup</option>
          <option value="Local delivery">Local delivery</option>
          <option value="Airport delivery">Airport delivery</option>
        </select>
        <label className="instantcheck"><input name="instantBook" type="checkbox" value="true" defaultChecked={q.instantBook==="true"}/> Instant booking</label>
        <select name="photos" aria-label="Photo type" defaultValue={q.photos||""}><option value="">Any photo status</option><option value="actual">Actual vehicle photos</option><option value="representative">Representative graphic only</option></select>
        <select
          name="sort"
          aria-label="Sort results"
          defaultValue={q.sort || "newest"}
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Most reviewed</option>
        </select>
        <button className="button">Search</button>
      </form>
      {start && end && !validDates && <p className="error" role="alert">The end date must be after the start date.</p>}
      <div className="pricechips" aria-label="Quick price filters"><span>Daily budget:</span>{[[0,100],[100,200],[200,400]].map(([low,high])=><Link key={low} href={`/browse?${new URLSearchParams({...q,min:String(low),max:String(high),page:"1"})}`}>${low}–${high}</Link>)}</div>
      <div className="resultsbar">
        <p>
          <span aria-live="polite">{count} {count === 1 ? "ride" : "rides"} found{validDates ? ` for ${days} ${days === 1 ? "day" : "days"}` : ""}</span>
        </p>
        <div className="actions">{user && Object.keys(savedQuery).length > 0 && <SaveSearchButton query={savedQuery}/>} {Object.keys(q).length > 0 && <Link href="/browse">Clear filters ×</Link>}</div>
      </div>
      {user?.subscriptionStatus!=="ACTIVE"&&<AdSense publisherId={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID||""} slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID||""}/>}
      {listings.length ? (
        <>
          <div className="grid">
            {listings.map((l) => (
              <ListingCard
                l={l}
                key={l.id}
                canFav={!!user}
                isFavorite={favoriteIds.has(l.id)}
                days={days}
              />
            ))}
          </div>
          {pages > 1 && (
            <nav className="pagination" aria-label="Search result pages">
              {page > 1 && <Link href={pageHref(page - 1)}>← Previous</Link>}
              <span>
                Page {page} of {pages}
              </span>
              {page < pages && <Link href={pageHref(page + 1)}>Next →</Link>}
            </nav>
          )}
        </>
      ) : (
        <div className="empty">
          <h2>No rides match yet</h2>
          <p>Try a nearby location, broader dates, or a higher price range.</p>
          <Link className="button" href="/browse">
            Reset search
          </Link>
        </div>
      )}
    </section>
  );
}
