import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { grantSignupBonus } from "@/lib/credits";

const schema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(2).max(40),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();
    const username = body.username.toLowerCase().trim();

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email or username already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        displayName: body.displayName.trim(),
        passwordHash,
        credits: 0,
      },
    });

    await grantSignupBonus(user.id);
    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid signup details" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
