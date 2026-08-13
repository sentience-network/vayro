import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ListingCard } from "@/components/ListingCard";
import { luxuryMinimumDeposit } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Vayro Lux",
  description: "Premium yachts, exotic cars, luxury SUVs, and elevated adventure vehicles.",
};

export default async function VayroLuxPage() {
  const user = await getUser();
  const listings = await db.listing.findMany({
    where: { category: "Luxury", status: "ACTIVE", NOT: { details: { path: ["_photoSource"], equals: "VAYRO_REPRESENTATIVE" } } },
    include: { photos: true, reviews: true },
    orderBy: { createdAt: "desc" },
  });
  const favorites = user
    ? await db.favorite.findMany({ where: { userId: user.id }, select: { listingId: true } })
    : [];
  const favoriteIds = new Set(favorites.map((favorite) => favorite.listingId));

  return (
    <section className="section page lux-page">
      <span className="eyebrow">VAYRO LUX</span>
      <h1>Exceptional vehicles. Elevated adventures.</h1>
      <p className="lede">
        Yachts, exotic cars, premium SUVs, luxury RVs, and other high-value vehicles shared by owners who expect a higher standard.
      </p>

      <div className="luxhero panel">
        <div>
          <span className="eyebrow">THE PREMIUM COLLECTION</span>
          <h2>Premium inventory with premium safeguards.</h2>
          <p>
            Vayro Lux has a higher marketplace fee—12.5% for standard renters and 10% for active Plus members—and every Lux listing requires a larger security deposit.
          </p>
          <Link className="button" href="/owner/new">List a Vayro Lux vehicle</Link>
        </div>
        <div className="luxfacts" aria-label="Vayro Lux pricing policy">
          <span><b>12.5%</b><small>standard fee</small></span>
          <span><b>10%</b><small>Plus fee</small></span>
          <span><b>${luxuryMinimumDeposit(500).toLocaleString()}+</b><small>minimum deposit</small></span>
        </div>
      </div>

      <div className="sectionhead">
        <div><span className="eyebrow">THE COLLECTION</span><h2>Available now</h2></div>
        <Link href="/browse?category=Luxury">View all Lux results →</Link>
      </div>

      {listings.length ? (
        <div className="grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} l={listing} canFav={!!user} isFavorite={favoriteIds.has(listing.id)} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>Be first in the collection</h2>
          <p>No Vayro Lux vehicles are active in this market yet.</p>
          <Link className="button" href="/owner/new">List the first Lux vehicle</Link>
        </div>
      )}

      <div className="notice luxnotice">
        <b>Lux policy:</b> Owners must provide accurate vehicle details and current photos. Rental requests, deposits, insurance, and identity verification remain subject to Vayro policies and available providers.
      </div>
    </section>
  );
}
