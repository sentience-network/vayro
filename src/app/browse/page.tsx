import Link from "next/link";
import { BookingStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ListingCard } from "@/components/ListingCard";
import { SaveSearchButton } from "@/components/FeatureForms";
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
      start && end && end > start
        ? {
            bookings: {
              none: {
                status: { in: [BookingStatus.PENDING, BookingStatus.ACCEPTED] },
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
            <option key={x}>{x}</option>
          ))}
        </select>
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
      <div className="resultsbar">
        <p>
          {count} {count === 1 ? "ride" : "rides"} found
        </p>
        <div className="actions">{user && Object.keys(savedQuery).length > 0 && <SaveSearchButton query={savedQuery}/>} {Object.keys(q).length > 0 && <Link href="/browse">Clear filters ×</Link>}</div>
      </div>
      {listings.length ? (
        <>
          <div className="grid">
            {listings.map((l) => (
              <ListingCard
                l={l}
                key={l.id}
                canFav={!!user}
                isFavorite={favoriteIds.has(l.id)}
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
