import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "", makeId = request.nextUrl.searchParams.get("makeId"), resource = request.nextUrl.searchParams.get("resource") || "makes";
  if (q.length > 80) return NextResponse.json({ error: "Search is too long" }, { status: 400 });
  if (resource === "models") {
    if (!makeId) return NextResponse.json({ items: [] });
    const items = await db.vehicleCatalogModel.findMany({ where: { makeId, active: true, ...(q ? { name: { contains: q, mode: "insensitive" } } : {}) }, select: { id: true, name: true, source: true, sourceUrl: true }, orderBy: { name: "asc" }, take: 100 });
    return NextResponse.json({ items }, { headers: { "cache-control": "public, max-age=300" } });
  }
  const items = await db.vehicleCatalogMake.findMany({ where: { active: true, ...(q ? { name: { contains: q, mode: "insensitive" } } : {}) }, select: { id: true, name: true, source: true, sourceUrl: true }, orderBy: { name: "asc" }, take: 100 });
  return NextResponse.json({ items }, { headers: { "cache-control": "public, max-age=300" } });
}
