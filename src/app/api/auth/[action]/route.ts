import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { authSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { deliverEmail } from "@/lib/email";
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  try {
    const { action } = await params;
    if (action === "logout") {
      (await cookies()).delete("vayro_session");
      return NextResponse.json({ ok: true });
    }
    const client = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
    if (!rateLimit(`${action}:${client}`, action === "login" ? 12 : 5, 60_000))
      return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
    const body = await req.json();
    const parsed = authSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    const { email, password, name, isOwner } = parsed.data;
    if (action === "register") {
      if (!name)
        return NextResponse.json(
          { error: "Name is required" },
          { status: 400 },
        );
      const user = await db.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(password, 12),
          name,
          isOwner: !!isOwner,
        },
      });
      await createSession(user.id);
      await deliverEmail({ userId: user.id, to: user.email, template: "WELCOME", subject: "Welcome to Vayro", payload: { message: `Hi ${user.name}, finish identity verification before your first booking.` } });
      return NextResponse.json({ ok: true });
    }
    if (action === "login") {
      const user = await db.user.findUnique({ where: { email } });
      if (
        !user ||
        user.disabled ||
        !(await bcrypt.compare(password, user.passwordHash))
      )
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 },
        );
      await createSession(user.id);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (e) {
    if (String(e).includes("Unique constraint"))
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    return NextResponse.json(
      { error: "Unable to authenticate" },
      { status: 500 },
    );
  }
}
