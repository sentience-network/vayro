import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase().trim() },
    });

    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        credits: user.credits,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid login details" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
