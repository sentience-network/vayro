import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
export async function POST() {
  try { await requireUser(); const cloud = process.env.CLOUDINARY_CLOUD_NAME, key = process.env.CLOUDINARY_API_KEY, secret = process.env.CLOUDINARY_API_SECRET; if (!cloud || !key || !secret) return NextResponse.json({ error: "Cloudinary is not configured. Add the three Cloudinary environment variables." }, { status: 503 }); const timestamp = Math.floor(Date.now() / 1000), folder = "vayro/listings", signature = crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex"); return NextResponse.json({ cloudName: cloud, apiKey: key, timestamp, folder, signature, uploadUrl: `https://api.cloudinary.com/v1_1/${cloud}/image/upload` }); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
}
