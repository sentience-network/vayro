import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { InspectionForm } from "@/components/InspectionForm";
export default async function InspectionPage({ params }: { params: Promise<{ id: string }> }) { const user = await getUser(); if (!user) redirect("/login"); const { id } = await params, booking = await db.booking.findUnique({ where: { id }, include: { listing: true } }); if (!booking || (booking.renterId !== user.id && booking.listing.ownerId !== user.id)) notFound(); return <section className="section page narrow"><span className="eyebrow">TRIP PROTECTION</span><h1>{booking.listing.title}</h1><InspectionForm bookingId={id}/></section>; }
