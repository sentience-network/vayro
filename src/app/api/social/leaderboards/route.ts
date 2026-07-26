import { NextResponse } from "next/server";
import { getLeaderboards } from "@/lib/social";

export async function GET() {
  const data = await getLeaderboards();
  return NextResponse.json(data);
}
