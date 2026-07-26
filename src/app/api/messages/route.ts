import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { grantCredits } from "@/lib/credits";
import { CREDIT_REWARDS } from "@/lib/constants";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const memberships = await prisma.conversationMember.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarHue: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: { select: { username: true, displayName: true } },
            },
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  return NextResponse.json({
    conversations: memberships.map((m) => ({
      id: m.conversation.id,
      updatedAt: m.conversation.updatedAt,
      members: m.conversation.members.map((mem) => mem.user),
      lastMessage: m.conversation.messages[0] ?? null,
    })),
  });
}

const startSchema = z.object({
  username: z.string().min(2),
  body: z.string().min(1).max(2000).optional(),
});

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    const body = startSchema.parse(await req.json());
    const other = await prisma.user.findUnique({
      where: { username: body.username.toLowerCase() },
    });
    if (!other) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (other.id === userId) {
      return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: other.id } } },
        ],
      },
      include: { members: true },
    });

    let conversationId = existing?.id;
    if (!conversationId) {
      const conversation = await prisma.conversation.create({
        data: {
          isGroup: false,
          members: {
            create: [{ userId }, { userId: other.id }],
          },
        },
      });
      conversationId = conversation.id;
    }

    if (body.body?.trim()) {
      await prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          body: body.body.trim(),
        },
      });
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
      await grantCredits(userId, CREDIT_REWARDS.messageActivity, "message_activity", {
        conversationId,
      });
    }

    return NextResponse.json({ conversationId }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid message request" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not start conversation" }, { status: 500 });
  }
}
