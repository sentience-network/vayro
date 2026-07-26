import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      service: "betme",
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error("health check failed", error);
    return NextResponse.json(
      { ok: false, service: "betme", error: "database_unavailable" },
      { status: 503 }
    );
  }
}
