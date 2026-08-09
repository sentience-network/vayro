import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const fetchSite = request.headers.get("sec-fetch-site");
    const origin = request.headers.get("origin");
    const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    const trustedOrigins = new Set([request.nextUrl.origin]);
    if (forwardedHost) trustedOrigins.add(`${forwardedProto}://${forwardedHost}`);
    if (process.env.NEXT_PUBLIC_APP_URL) {
      try { trustedOrigins.add(new URL(process.env.NEXT_PUBLIC_APP_URL).origin); } catch {}
    }
    if (fetchSite === "cross-site" || (origin && !trustedOrigins.has(origin)))
      return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/api/:path*"] };
