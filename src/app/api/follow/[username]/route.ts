import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { grantCredits } from "@/lib/credits";
import { CREDIT_REWARDS } from "@/lib/constants";
import { evaluateUserBadges } from "@/lib/badges";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { username } = await params;
  const target = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.id === userId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId: userId, followingId: target.id },
    },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({
    data: { followerId: userId, followingId: target.id },
  });

  const followCount = await prisma.follow.count({ where: { followerId: userId } });
  if (followCount === 1) {
    await grantCredits(userId, CREDIT_REWARDS.firstFollow, "first_follow_bonus", {
      followingId: target.id,
    });
  }
  await evaluateUserBadges(userId);

  return NextResponse.json({ following: true });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const userId = await getSessionUserId();
  const { username } = await params;
  const target = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [followers, following, isFollowing] = await Promise.all([
    prisma.follow.count({ where: { followingId: target.id } }),
    prisma.follow.count({ where: { followerId: target.id } }),
    userId
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: { followerId: userId, followingId: target.id },
          },
        })
      : null,
  ]);

  return NextResponse.json({
    followers,
    following,
    isFollowing: Boolean(isFollowing),
  });
}
