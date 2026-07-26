import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getProfileByUsername } from "@/lib/social";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const safe = {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarHue: profile.avatarHue,
    credits: profile.credits,
    accuracyScore: profile.accuracyScore,
    totalPredictions: profile.totalPredictions,
    correctPredictions: profile.correctPredictions,
    creatorScore: profile.creatorScore,
    referralCode: profile.referralCode,
    createdAt: profile.createdAt,
    badges: profile.badges,
    markets: profile.markets,
    entries: profile.entries,
    _count: profile._count,
  };
  return NextResponse.json({ profile: safe });
}

const updateSchema = z.object({
  displayName: z.string().min(2).max(40).optional(),
  bio: z.string().min(1).max(280).optional(),
  avatarHue: z.number().int().min(0).max(359).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.username !== username.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = updateSchema.parse(await req.json());
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: body.displayName?.trim(),
        bio: body.bio?.trim(),
        avatarHue: body.avatarHue,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarHue: true,
      },
    });
    return NextResponse.json({ profile: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid profile update" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
