import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { syncNhtsaCatalog } from "@/lib/vehicle-catalog";
const schema = z.object({ source: z.literal("NHTSA"), scope: z.enum(["makes", "full"]).default("full") });
export async function POST(request: NextRequest) { try { await requireAdmin(); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid sync request" }, { status: 400 }); return NextResponse.json(await syncNhtsaCatalog(parsed.data.scope)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Catalog sync failed" }, { status: 500 }); } }
