import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { grantReferralRewards, grantSignupBonus } from "@/lib/credits";
import { awardBadge, ensureBadgeCatalog, evaluateUserBadges } from "@/lib/badges";
import { referralCodeFromUsername } from "@/lib/social";

const schema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(2).max(40),
  password: z.string().min(8).max(72),
  referralCode: z.string().min(4).max(24).optional(),
});

export async function POST(req: Request) {
  try {
    await ensureBadgeCatalog();
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

    let referredById: string | undefined;
    if (body.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: body.referralCode.trim().toUpperCase() },
      });
      if (!referrer) {
        return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
      }
      referredById = referrer.id;
    }

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        displayName: body.displayName.trim(),
        passwordHash,
        credits: 0,
        referralCode: referralCodeFromUsername(username),
        referredById,
        avatarHue: Math.floor(Math.random() * 360),
      },
    });

    await grantSignupBonus(user.id);
    if (referredById) {
      await grantReferralRewards(user.id, referredById);
      await awardBadge(referredById, "signal_booster");
      await evaluateUserBadges(referredById);
    }
    await awardBadge(user.id, "welcome_caller");
    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        referralCode: user.referralCode,
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
