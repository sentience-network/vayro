import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { decodeNhtsaVin } from "@/lib/vehicle-catalog";
export async function GET(request: NextRequest, { params }: { params: Promise<{ vin: string }> }) { try { const user = await requireUser(), { vin } = await params; if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return NextResponse.json({ error: "VIN must contain 17 valid characters" }, { status: 400 }); if (!rateLimit(`vin:${user.id}`, 10, 60_000)) return NextResponse.json({ error: "VIN lookup limit reached" }, { status: 429 }); const year = Number(request.nextUrl.searchParams.get("year")) || undefined; return NextResponse.json(await decodeNhtsaVin(vin, year)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "VIN lookup failed" }, { status: 502 }); } }
